import { cookies } from "next/headers";
import { prisma } from "./db";
import { unitPriceFor, packUnits, packLabel } from "./pricing";

export type CartItem = {
  productId: string;
  color: string;
  packId?: string; // set when ordering prepacks
  size?: string; // set when ordering individual sizes
  qty: number; // number of packs, or number of units
};

const COOKIE = "cart";

export async function readCart(): Promise<CartItem[]> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Only callable from Server Actions / Route Handlers.
export async function writeCart(items: CartItem[]) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export type PricedLine = {
  index: number;
  productId: string;
  productName: string;
  variantId?: string;
  packId?: string;
  description: string;
  units: number;
  unitPrice: number;
  lineTotal: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  moqIssues: { productName: string; moq: number; units: number }[];
};

// Prices the cart with quantity breaks applied across ALL units of the same
// product (packs + loose sizes combined), and checks MOQs per product.
export async function priceCart(items: CartItem[]): Promise<PricedCart> {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { priceBreaks: true, packs: true, variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Total units per product decides the price break tier
  const unitsByProduct = new Map<string, number>();
  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) continue;
    const pack = item.packId
      ? product.packs.find((p) => p.id === item.packId)
      : undefined;
    const units = pack ? packUnits(pack.contents) * item.qty : item.qty;
    unitsByProduct.set(
      item.productId,
      (unitsByProduct.get(item.productId) ?? 0) + units
    );
  }

  const lines: PricedLine[] = [];
  items.forEach((item, index) => {
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
    const variant =
      !pack && item.size
        ? product.variants.find(
            (v) => v.color === item.color && v.size === item.size
          )
        : undefined;
    const description = pack
      ? `${product.name} — ${item.color} / ${pack.name} (${packLabel(pack.contents)}) × ${item.qty}`
      : `${product.name} — ${item.color} / Size ${item.size} × ${item.qty}`;
    lines.push({
      index,
      productId: product.id,
      productName: product.name,
      variantId: variant?.id,
      packId: pack?.id,
      description,
      units,
      unitPrice,
      lineTotal: unitPrice * units,
    });
  });

  const moqIssues = [...unitsByProduct.entries()]
    .map(([productId, units]) => {
      const product = byId.get(productId)!;
      return { productName: product.name, moq: product.moq, units };
    })
    .filter((x) => x.units < x.moq);

  return {
    lines,
    subtotal: lines.reduce((sum, l) => sum + l.lineTotal, 0),
    moqIssues,
  };
}
