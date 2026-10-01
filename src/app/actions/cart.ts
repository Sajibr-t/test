/**
 * Cart and checkout server actions.
 *
 * These run on the server and are wired directly to <form action={...}> in the
 * pages, so the cart works without any client-side JavaScript.
 *
 * Every action re-checks `requireApprovedBuyer()` itself. Hiding a button in
 * the UI is not security — a server action is a real HTTP endpoint that anyone
 * can post to, so each one must authorise independently.
 */
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { OrderError, submitOrder } from "@/lib/order-service";
import { cartFitsStorage, cartItemSchema, selectionUnits } from "@/lib/cart-validation";
import { shopCopy } from "@/lib/shop-copy";
import { prisma } from "@/lib/db";
import { requireApprovedBuyer } from "@/lib/session";
import { readCart, writeCart } from "@/lib/cart";
import { getLang } from "@/lib/i18n-server";

export type CartFeedback = { ok: boolean; message: string; units?: number };

async function addSelection(formData: FormData): Promise<CartFeedback> {
  await requireApprovedBuyer();
  const copy = shopCopy(await getLang());
  const productId = String(formData.get("productId") ?? "");
  const color = String(formData.get("color") ?? "");
  const qty = Number(formData.get("qty"));
  const field = String(formData.get("size") ?? "");
  const packId = field.startsWith("pack:") ? field.slice(5) : String(formData.get("packId") ?? "") || undefined;
  const size = packId ? undefined : field || undefined;
  if (!Number.isSafeInteger(qty) || qty < 1 || qty > 10000) return { ok: false, message: copy.invalid };
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true, packs: true } });
  if (!product) return { ok: false, message: copy.invalid };
  const pack = product.packs.find(p => p.id === packId);
  let lineQty = qty;
  if (pack) {
    const perPack = selectionUnits(product, { productId, color, packId, qty: 1 });
    if (perPack === null) return { ok: false, message: copy.invalid };
    lineQty = Math.ceil(qty / perPack);
  }
  const candidate = cartItemSchema.safeParse({ productId, color, packId, size, qty: lineQty });
  if (!candidate.success) return { ok: false, message: copy.invalid };
  const units = selectionUnits(product, candidate.data);
  if (units === null) return { ok: false, message: copy.invalid };
  const cart = await readCart();
  const existing = cart.find(i => i.productId === productId && i.color === color && i.packId === packId && i.size === size);
  if (existing) {
    existing.qty += lineQty;
    if (selectionUnits(product, existing) === null) return { ok: false, message: copy.invalid };
  } else cart.push(candidate.data);
  if (!cartFitsStorage(cart)) return { ok: false, message: copy.full };
  await writeCart(cart);
  revalidatePath("/", "layout");
  return { ok: true, message: copy.added, units };
}

export async function addToCartInline(_previous: CartFeedback, formData: FormData): Promise<CartFeedback> {
  return addSelection(formData);
}

export async function addToCart(formData: FormData) {
  const result = await addSelection(formData);
  const raw = String(formData.get("returnTo") ?? "");
  const back = raw.startsWith("/") && !raw.startsWith("//") && !/[\\\x00-\x20]/.test(raw) ? raw : "/catalog";
  const url = new URL(back, "https://store.invalid");
  url.searchParams.set(result.ok ? "added" : "error", result.ok ? "1" : "invalid");
  redirect(url.pathname + url.search);
}

export async function updateCartQuantity(formData: FormData) {
  await requireApprovedBuyer();
  const cart = await readCart();
  const index = Number(formData.get("index"));
  const qty = Number(formData.get("qty"));
  if (!Number.isSafeInteger(index) || !cart[index] || !Number.isSafeInteger(qty) || qty < 1 || qty > 10000) redirect("/cart?error=invalid");
  const item = { ...cart[index], qty };
  const product = await prisma.product.findUnique({ where: { id: item.productId }, include: { variants: true, packs: true } });
  if (!product || selectionUnits(product, item) === null) redirect("/cart?error=invalid");
  cart[index] = item;
  if (!cartFitsStorage(cart)) redirect("/cart?error=invalid");
  await writeCart(cart);
  redirect("/cart?updated=1");
}

export async function removeFromCart(formData: FormData) {
  await requireApprovedBuyer();
  const index = Number(formData.get("index"));
  const cart = await readCart();
  if (!Number.isSafeInteger(index) || index < 0 || index >= cart.length) redirect("/cart");
  cart.splice(index, 1);
  await writeCart(cart);
  redirect("/cart");
}

export async function clearCart() {
  await requireApprovedBuyer();
  await writeCart([]);
  redirect("/cart");
}

/**
 * Turn the cart into a confirmed order plus its Net 30 invoice.
 *
 * There is no card payment: placing an order creates an invoice the buyer pays
 * within 30 days, which is how wholesale trade accounts normally work.
 *
 * Prices are recalculated here from the database rather than taken from the
 * page the buyer submitted, so the order is always written at true current
 * prices even if the cart page was left open while an admin edited them.
 *
 * Line items store a snapshot (description, unitPrice, lineTotal) instead of
 * only referencing the product. Invoices must stay accurate years later, so
 * they must not change when a product is renamed or repriced.
 */
export async function placeOrder(formData: FormData) {
  const user = await requireApprovedBuyer();
  let order;
  try {
    order = await submitOrder({ userId: user.id, key: String(formData.get("checkoutKey") ?? ""), cart: await readCart(), notes: String(formData.get("notes") ?? "").trim() || null, lang: await getLang(), delivery: { name: formData.get("deliveryName"), phone: formData.get("deliveryPhone"), address: formData.get("deliveryAddress"), city: formData.get("deliveryCity"), postalCode: formData.get("deliveryPostalCode"), country: formData.get("deliveryCountry") } });
  } catch (error) {
    if (error instanceof OrderError) redirect("/cart?error=" + error.message);
    console.error("Order submission failed", error instanceof Error ? error.name : "UnknownError");
    redirect("/cart?error=retry");
  }
  redirect(`/orders/${order.id}?placed=1`);
}
