/**
 * Wholesale pricing maths.
 *
 * Two ideas drive every price in this store:
 *
 * 1. Quantity breaks — a product has a `basePrice` plus a list of breaks such as
 *    "48+ units => $5.95 each". The more a buyer orders, the lower the unit price.
 * 2. Prepacks — a fixed size run sold as one unit, e.g. {"2-3Y":1,"4-5Y":2}.
 *    Buyers order whole packs; we still price per garment underneath.
 *
 * All money is stored and returned as INTEGER CENTS, never floats, so totals
 * can't drift from rounding. Use `money()` in lib/format.ts to display it.
 */

/** One quantity break: from `minQty` units upwards, each unit costs `unitPrice`. */
type Break = { minQty: number; unitPrice: number };

/**
 * Unit price (in cents) for buying `qty` total units of a product.
 *
 * Breaks are sorted ascending and applied in order, so the LAST one the
 * quantity qualifies for wins — i.e. the buyer always gets the deepest
 * discount they've earned. Below the first break they pay `basePrice`.
 */
export function unitPriceFor(
  basePrice: number,
  priceBreaks: Break[],
  qty: number
): number {
  let price = basePrice;
  for (const b of [...priceBreaks].sort((a, b) => a.minQty - b.minQty)) {
    if (qty >= b.minQty) price = b.unitPrice;
  }
  return price;
}

/**
 * The cheapest a unit can ever get, used for "From $X" labels on cards.
 * Includes `basePrice` in the comparison in case a break is mis-entered
 * higher than the base price.
 */
export function lowestPrice(basePrice: number, priceBreaks: Break[]): number {
  return Math.min(basePrice, ...priceBreaks.map((b) => b.unitPrice));
}

/**
 * Total garments in one prepack.
 * `contentsJson` is stored on Pack.contents as JSON, e.g. '{"2-3Y":1,"4-5Y":2}'
 * which totals 3 units.
 */
export function packUnits(contentsJson: string): number {
  const contents = JSON.parse(contentsJson) as Record<string, number>;
  return Object.values(contents).reduce((a, b) => a + b, 0);
}

/**
 * Human-readable size run for a prepack, e.g. "1 2-3Y-2 4-5Y" => shown to
 * buyers as the pack breakdown on the product page.
 */
export function packLabel(contentsJson: string): string {
  const contents = JSON.parse(contentsJson) as Record<string, number>;
  return Object.entries(contents)
    .map(([size, qty]) => `${qty}${size}`)
    .join("-");
}
