import { prisma } from "./db";
import { productCopy, category, colour, fabric, type Lang } from "./i18n";
import { productImage, categoryImage } from "./display";
import { packLabel, packUnits } from "./pricing";
import { selectionUnits } from "./cart-validation";
import type { ShopProduct } from "@/components/shop/ProductCard";

export function getShopProducts() {
  return prisma.product.findMany({ where: { active: true }, include: { variants: true, packs: true, priceBreaks: { orderBy: { minQty: "asc" } } }, orderBy: { createdAt: "desc" } });
}
export type CatalogueProduct = Awaited<ReturnType<typeof getShopProducts>>[number];

export function shopProduct(p: CatalogueProduct, lang: Lang, approved: boolean, cartUnits = 0): ShopProduct {
  const colors = [...new Set(p.variants.map(v => v.color))];
  return {
    id: p.id, name: productCopy(lang, p).name, styleCode: p.styleCode, category: category(lang, p.category),
    image: p.imageUrl ?? productImage(p.styleCode) ?? categoryImage(p.category), moq: p.moq, fabric: p.fabric ? fabric(lang, p.fabric) : null,
    colors: colors.map(value => ({ value, label: colour(lang, value) })),
    variants: p.variants.map(v => ({ color: v.color, size: v.size })),
    packs: p.packs.flatMap(pk => {
      const validColors = colors.filter(color => selectionUnits(p, { productId: p.id, color, packId: pk.id, qty: 1 }) !== null);
      return validColors.length ? [{ id: pk.id, label: packLabel(pk.contents), units: packUnits(pk.contents), colors: validColors }] : [];
    }),
    pricing: approved ? { base: p.basePrice, breaks: p.priceBreaks.map(b => ({ minQty: b.minQty, unitPrice: b.unitPrice })), cartUnits } : null,
  };
}
