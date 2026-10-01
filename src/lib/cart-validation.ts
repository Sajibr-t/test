import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(100),
  color: z.string().min(1).max(100),
  packId: z.string().min(1).max(100).optional(),
  size: z.string().min(1).max(100).optional(),
  qty: z.number().int().min(1).max(10000),
}).refine((item) => Boolean(item.packId) !== Boolean(item.size));

export function cartFitsCookie(items: unknown[]) {
  return encodeURIComponent(JSON.stringify(items)).length <= 3800;
}

type SelectionProduct = {
  active: boolean;
  variants: { color: string; size: string }[];
  packs: { id: string; contents: string }[];
};

/** Resolve only purchasable selections, before totals and discounts are computed. */
export function selectionUnits(product: SelectionProduct, item: z.infer<typeof cartItemSchema>): number | null {
  if (!product.active || !cartItemSchema.safeParse(item).success) return null;
  if (!item.packId) return product.variants.some(v => v.color === item.color && v.size === item.size) ? item.qty : null;
  const pack = product.packs.find(p => p.id === item.packId);
  if (!pack) return null;
  try {
    const entries = Object.entries(JSON.parse(pack.contents));
    if (!entries.length || entries.some(([size, qty]) =>
      typeof qty !== "number" || !Number.isSafeInteger(qty) || qty < 1 ||
      !product.variants.some(v => v.color === item.color && v.size === size))) return null;
    const units = entries.reduce((sum, [, qty]) => sum + Number(qty), 0) * item.qty;
    return Number.isSafeInteger(units) && units <= 100000 ? units : null;
  } catch { return null; }
}

export function cartFitsStorage(items: unknown[]) {
  return items.length <= 200 && JSON.stringify(items).length <= 100000;
}
