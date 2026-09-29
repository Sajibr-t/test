type Break = { minQty: number; unitPrice: number };

// Returns the unit price (cents) for `qty` total units of a product,
// applying the deepest quantity break the qty qualifies for.
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

export function lowestPrice(basePrice: number, priceBreaks: Break[]): number {
  return Math.min(basePrice, ...priceBreaks.map((b) => b.unitPrice));
}

export function packUnits(contentsJson: string): number {
  const contents = JSON.parse(contentsJson) as Record<string, number>;
  return Object.values(contents).reduce((a, b) => a + b, 0);
}

export function packLabel(contentsJson: string): string {
  const contents = JSON.parse(contentsJson) as Record<string, number>;
  return Object.entries(contents)
    .map(([size, qty]) => `${qty}${size}`)
    .join("-");
}
