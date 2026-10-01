/**
 * The shopping cart.
 *
 * Signed-in buyers have a database-backed cart shared across devices.
 * Anonymous carts use an httpOnly cookie. Cart actions require approval.
 *
 * Only IDs and quantities are stored in the cookie. Prices are recalculated
 * from the database on every render by `priceCart()`, so a buyer cannot tamper
 * with the cookie to give themselves a discount, and price changes in the
 * admin area are reflected immediately in open carts.
 */
import { getUser } from "./session";
import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { cartItemSchema, selectionUnits } from "./cart-validation";
import { unitPriceFor, packUnits, packLabel } from "./pricing";
import {
  t,
  colour as colourName,
  packName,
  productCopy,
  type Lang,
} from "./i18n";

/**
 * One cart line. A line is EITHER a prepack (`packId` set) OR loose units of a
 * single size (`size` set) — never both. `qty` means "number of packs" in the
 * first case and "number of garments" in the second.
 */
export type CartItem = {
  productId: string;
  color: string;
  packId?: string; // set when ordering prepacks
  size?: string; // set when ordering individual sizes
  qty: number; // number of packs, or number of units
};

const COOKIE = "cart";

/** Current cart contents. Returns an empty cart if the cookie is missing or corrupt. */
export async function readCart(): Promise<CartItem[]> {
  const store = await cookies();
  const user = await getUser();
  const raw = user ? user.savedCart : store.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const result = cartItemSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

/**
 * Overwrite the cart cookie.
 * Next.js only allows setting cookies while handling a request that can
 * respond, so this must be called from a Server Action or Route Handler —
 * calling it while rendering a page will throw.
 */
export async function writeCart(items: CartItem[]) {
  const user = await getUser();
  if (user) {
    await prisma.user.update({where: {id: user.id}, data: {savedCart: JSON.stringify(items)}});
    return;
  }
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(items), {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // cart persists for 30 days
  });
}

/** A cart line with live prices attached, ready to render or turn into an order. */
export type PricedLine = {
  index: number; // position in the cart cookie, used by the "remove" button
  productId: string;
  productName: string;
  variantId?: string; // set for loose sizes (links to a specific SKU)
  packId?: string; // set for prepacks
  description: string; // display text, e.g. "Palm Tee — Sky / Pack (1 2-3Y-2 4-5Y) × 2"
  units: number; // garments on this line
  unitPrice: number; // cents per garment, after quantity breaks
  lineTotal: number; // unitPrice * units
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number; // cents
  /** Products below their minimum order quantity — checkout is blocked while non-empty. */
  moqIssues: { productName: string; moq: number; units: number }[];
  invalidItems: number;
  stockNeeds: { variantId: string; quantity: number; available: number; label: string }[];
  stockIssues: { label: string; available: number; quantity: number }[];
};

/**
 * Turn raw cart items into priced lines.
 *
 * The important rule: quantity breaks are applied to the buyer's TOTAL units of
 * a product, with prepacks and loose sizes added together. So 2 packs of 6 plus
 * 40 loose units counts as 52 units and earns the 48+ price on every line of
 * that product — not two separate smaller tiers. This is why the function
 * tallies `unitsByProduct` first and only then prices each line.
 *
 * Also returns any products that fall under their MOQ so the cart page can
 * explain exactly how many more units are needed.
 *
 * `lang` decides the language of the generated line descriptions. When an order
 * is placed these descriptions are copied into the order as a snapshot, so the
 * invoice ends up in whichever language the buyer was shopping in.
 */
export async function priceCart(
  items: CartItem[],
  lang: Lang = "en",
  db: Pick<Prisma.TransactionClient, "product"> = prisma
): Promise<PricedCart> {
  // One query for every product in the cart, rather than one per line.
  const productIds = [...new Set(items.filter(i => cartItemSchema.safeParse(i).success).map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: { priceBreaks: true, packs: true, variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const validItems = items.map((item, index) => {
    if (!cartItemSchema.safeParse(item).success) return { item, index, units: null };
    const product = byId.get(item.productId);
    return { item, index, units: product ? selectionUnits(product, item) : null };
  }).filter(entry => entry.units !== null);

  // Pass 1 — total units per product, which decides the price break tier.
  const unitsByProduct = new Map<string, number>();
  for (const { item } of validItems) {
    const product = byId.get(item.productId);
    if (!product) continue; // product deleted since it was added to the cart
    const pack = item.packId
      ? product.packs.find((p) => p.id === item.packId)
      : undefined;
    const units = pack ? packUnits(pack.contents) * item.qty : item.qty;
    unitsByProduct.set(
      item.productId,
      (unitsByProduct.get(item.productId) ?? 0) + units
    );
  }

  // Pass 2 — price each line using the tier earned by the product's total.
  const lines: PricedLine[] = [];
  const stockByVariant = new Map<string, { variantId: string; quantity: number; available: number; label: string }>();
  validItems.forEach(({ item, index }) => {
    const product = byId.get(item.productId);
    if (!product) return;
    const totalUnits = unitsByProduct.get(item.productId) ?? 0;
    const unitPrice = unitPriceFor(
      product.basePrice,
      product.priceBreaks,
      totalUnits
    );
    const pack = item.packId
      ? product.packs.find((p) => p.id === item.packId)
      : undefined;
    const units = pack ? packUnits(pack.contents) * item.qty : item.qty;
    // Loose-size lines resolve to a concrete variant (SKU); packs span several.
    const variant =
      !pack && item.size
        ? product.variants.find(
            (v) => v.color === item.color && v.size === item.size
          )
        : undefined;
    const name = productCopy(lang, product).name;
    const contents: Record<string, number> = pack ? JSON.parse(pack.contents) : { [item.size!]: 1 };
    for (const [size, perSelection] of Object.entries(contents)) {
      const sku = product.variants.find(v => v.color === item.color && v.size === size)!;
      const previous = stockByVariant.get(sku.id);
      stockByVariant.set(sku.id, { variantId: sku.id, quantity: (previous?.quantity ?? 0) + perSelection * item.qty,
        available: sku.stock, label: `${name} / ${item.color} / ${size}` });
    }
    const colourLabel = colourName(lang, item.color);
    const description = pack
      ? `${name} — ${colourLabel} / ${packName(lang, pack.name)} (${packLabel(pack.contents)}) × ${item.qty}`
      : `${name} — ${colourLabel} / ${t(lang, "product.sizeLabel")} ${item.size} × ${item.qty}`;
    lines.push({
      index,
      productId: product.id,
      productName: name,
      variantId: variant?.id,
      packId: pack?.id,
      description,
      units,
      unitPrice,
      lineTotal: unitPrice * units,
    });
  });

  // Minimum order quantity is enforced per product across the whole cart.
  const moqIssues = [...unitsByProduct.entries()]
    .map(([productId, units]) => {
      const product = byId.get(productId)!;
      return {
        productName: productCopy(lang, product).name,
        moq: product.moq,
        units,
      };
    })
    .filter((x) => x.units < x.moq);

  return {
    lines,
    subtotal: lines.reduce((sum, l) => sum + l.lineTotal, 0),
    moqIssues,
    invalidItems: items.length - validItems.length,
    stockNeeds: [...stockByVariant.values()],
    stockIssues: [...stockByVariant.values()].filter(need => need.quantity > need.available),
  };
}
