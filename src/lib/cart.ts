/**
 * The shopping cart.
 *
 * The cart lives entirely in an httpOnly cookie — there is no cart table.
 * That keeps it simple and survives a page refresh, at the cost of a size
 * limit (~4KB of cookie), which is plenty for a wholesale order of line items.
 *
 * Only IDs and quantities are stored in the cookie. Prices are recalculated
 * from the database on every render by `priceCart()`, so a buyer cannot tamper
 * with the cookie to give themselves a discount, and price changes in the
 * admin area are reflected immediately in open carts.
 */
import { cookies } from "next/headers";
import { prisma } from "./db";
import { unitPriceFor, packUnits, packLabel } from "./pricing";

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
  const raw = store.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(items), {
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
 */
export async function priceCart(items: CartItem[]): Promise<PricedCart> {
  // One query for every product in the cart, rather than one per line.
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { priceBreaks: true, packs: true, variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Pass 1 — total units per product, which decides the price break tier.
  const unitsByProduct = new Map<string, number>();
  for (const item of items) {
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
    // Loose-size lines resolve to a concrete variant (SKU); packs span several.
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

  // Minimum order quantity is enforced per product across the whole cart.
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
