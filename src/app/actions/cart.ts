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

export async function placeOrder(formData: FormData) {
  const user = await requireApprovedBuyer();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const cart = await readCart();
  if (cart.length === 0) redirect("/cart");
  const priced = await priceCart(cart);
  if (priced.lines.length === 0) redirect("/cart");
  if (priced.moqIssues.length > 0) redirect("/cart?error=moq");

  const orderCount = await prisma.order.count();
  const invoiceCount = await prisma.invoice.count();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

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
