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
import { prisma } from "@/lib/db";
import { requireApprovedBuyer } from "@/lib/session";
import { readCart, writeCart, priceCart, type CartItem } from "@/lib/cart";

export async function addToCart(formData: FormData) {
  await requireApprovedBuyer();
  const productId = String(formData.get("productId") ?? "");
  const color = String(formData.get("color") ?? "");
  const packId = String(formData.get("packId") ?? "") || undefined;
  const size = String(formData.get("size") ?? "") || undefined;
  const qty = Math.floor(Number(formData.get("qty") ?? 0));

  if (!productId || !color || qty < 1 || (!packId && !size)) {
    redirect(`/catalog/${productId}?error=invalid`);
  }

  const cart = await readCart();
  // Merge with an identical existing line if present
  const existing = cart.find(
    (i) =>
      i.productId === productId &&
      i.color === color &&
      i.packId === packId &&
      i.size === size
  );
  if (existing) existing.qty += qty;
  else cart.push({ productId, color, packId, size, qty } satisfies CartItem);
  await writeCart(cart);
  redirect(`/catalog/${productId}?added=1`);
}

export async function removeFromCart(formData: FormData) {
  await requireApprovedBuyer();
  const index = Number(formData.get("index"));
  const cart = await readCart();
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
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const cart = await readCart();
  if (cart.length === 0) redirect("/cart");
  const priced = await priceCart(cart);
  if (priced.lines.length === 0) redirect("/cart");
  // Re-check MOQs server-side: the cart page disables the button, but a buyer
  // could still post this form directly.
  if (priced.moqIssues.length > 0) redirect("/cart?error=moq");

  // Sequential, human-friendly references: PO-1001, INV-1001, ...
  // Note: counting rows is fine at this scale but two orders placed at the very
  // same moment could collide — swap to a database sequence before high volume.
  const orderCount = await prisma.order.count();
  const invoiceCount = await prisma.invoice.count();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Net 30

  // Order, its line items and the invoice are created in one nested write, so
  // an order can never end up saved without its invoice.
  const order = await prisma.order.create({
    data: {
      orderNumber: `PO-${1001 + orderCount}`,
      userId: user.id,
      status: "PENDING",
      subtotal: priced.subtotal,
      notes,
      items: {
        create: priced.lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          packId: l.packId,
          description: l.description,
          quantity: l.units,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
        })),
      },
      invoice: {
        create: {
          invoiceNumber: `INV-${1001 + invoiceCount}`,
          terms: "Net 30",
          dueDate,
        },
      },
    },
  });

  await writeCart([]);
  redirect(`/orders/${order.id}?placed=1`);
}
