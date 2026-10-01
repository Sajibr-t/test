import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "./db";
import { priceCart, type CartItem } from "./cart";
import type { Lang } from "./i18n";
import { getStoreSettings, checkoutReady, deliverySchema, orderTotals } from "./store-settings";
import { queueEmail, siteOrigin } from "./email";

export class OrderError extends Error {}

export async function submitOrder(input: { userId: string; key: string; cart: CartItem[]; notes: string | null; lang: Lang; delivery: unknown }, db: PrismaClient = prisma) {
  if (!/^[a-f0-9-]{36}$/i.test(input.key)) throw new OrderError("invalid");
  const checkoutKey = createHash("sha256").update(`${input.userId}:${input.key}`).digest("hex");
  const existing = await db.order.findUnique({ where: { checkoutKey } });
  if (existing) return existing;
  try {
    return await db.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { id: input.userId } });
      if (!user || (user.role !== "ADMIN" && user.status !== "APPROVED")) throw new OrderError("invalid");
      const duplicate = await tx.order.findUnique({ where: { checkoutKey } });
      if (duplicate) return duplicate;
      const settings = await getStoreSettings(tx);
      if (!checkoutReady(settings)) throw new OrderError("setup");
      const delivery = deliverySchema.safeParse(input.delivery);
      if (!delivery.success || !settings.shippingCountries.includes(delivery.data.country)) throw new OrderError("delivery");
      const priced = await priceCart(input.cart, input.lang, tx);
      if (!priced.lines.length || priced.invalidItems) throw new OrderError("changed");
      if (priced.moqIssues.length) throw new OrderError("moq");
      if (priced.stockIssues.length) throw new OrderError("stock");
      const totals = orderTotals(priced.subtotal, settings);
      if (!Number.isSafeInteger(totals.total) || totals.total > 2147483647) throw new OrderError("total");
      for (const need of priced.stockNeeds) {
        const updated = await tx.variant.updateMany({ where: { id: need.variantId, stock: { gte: need.quantity } }, data: { stock: { decrement: need.quantity } } });
        if (updated.count !== 1) throw new OrderError("stock");
      }
      const reference = checkoutKey.slice(0, 20).toUpperCase();
      const order = await tx.order.create({ data: {
        checkoutKey, orderNumber: `PO-${reference}`, userId: user.id, subtotal: priced.subtotal, notes: input.notes?.slice(0, 2000),
        ...totals,
        billingSnapshot: JSON.stringify({ businessName: user.businessName, contactName: user.contactName, address: user.address || [delivery.data.address, delivery.data.city + " " + delivery.data.postalCode, delivery.data.country].join("\n"), email: user.email, taxId: user.taxId }),
        shippingSnapshot: JSON.stringify(delivery.data),
        sellerSnapshot: JSON.stringify({ businessName: settings.businessName, businessAddress: settings.businessAddress, supportEmail: settings.supportEmail, supportPhone: settings.supportPhone, paymentInstructions: settings.paymentInstructions }),
        items: { create: priced.lines.map(l => ({ productId: l.productId, variantId: l.variantId, packId: l.packId, description: l.description, quantity: l.units, unitPrice: l.unitPrice, lineTotal: l.lineTotal })) },
        allocations: { create: priced.stockNeeds.map(n => ({ variantId: n.variantId, quantity: n.quantity })) },
        invoice: { create: { invoiceNumber: `INV-${reference}`, terms: "Net 30", dueDate: new Date(Date.now() + 30 * 86400000) } },
      } });
      await queueEmail(tx, { to: user.email, subject: `Order ${order.orderNumber} received`, text: `Thank you, ${user.contactName}. Your order has been received. Total: MYR ${((order.total ?? order.subtotal) / 100).toFixed(2)}. Payment terms: Net 30.\n\n${settings.paymentInstructions}\n\n${siteOrigin() ? `${siteOrigin()}/orders/${order.id}` : "Sign in to your account to view your invoice."}`, dedupeKey: `order:${order.id}:received` });
      await tx.user.updateMany({where: {id: user.id, savedCart: JSON.stringify(input.cart)}, data: {savedCart: "[]"}});
      return order;
    });
  } catch (error) {
    // A concurrent retry may have committed while this transaction was waiting.
    const duplicate = await db.order.findUnique({ where: { checkoutKey } });
    if (duplicate) return duplicate;
    throw error;
  }
}

export async function changeOrderStatus(orderId: string, status: string, db: PrismaClient = prisma, tracking?: { carrier: string; trackingNumber: string }) {
  return db.$transaction(async tx => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { allocations: true, invoice: true, user: true } });
    if (!order) throw new OrderError("missing");
    if (order.status === status) return;
    const allowed: Record<string, string[]> = { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["SHIPPED", "CANCELLED"], SHIPPED: [], CANCELLED: [] };
    if (!allowed[order.status]?.includes(status)) throw new OrderError("transition");
    if (status === "SHIPPED" && (!tracking?.carrier.trim() || !tracking?.trackingNumber.trim() || tracking.carrier.length > 100 || tracking.trackingNumber.length > 150)) throw new OrderError("tracking");
    if (status === "CANCELLED" && order.invoice?.status === "PAID") throw new OrderError("paid");
    const changed = await tx.order.updateMany({ where: { id: orderId, status: order.status }, data: { status, ...(status === "SHIPPED" ? tracking : {}) } });
    if (changed.count !== 1) throw new OrderError("transition");
    if (status === "CANCELLED") {
      for (const item of order.allocations) await tx.variant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      await tx.invoice.updateMany({ where: { orderId, status: "UNPAID" }, data: { status: "VOID" } });
    }
    await queueEmail(tx, { to: order.user.email, subject: `${order.orderNumber}: ${status.toLowerCase()}`, text: `Your order ${order.orderNumber} is now ${status.toLowerCase()}.${status === "SHIPPED" ? `\nCarrier: ${tracking!.carrier}\nTracking number: ${tracking!.trackingNumber}` : ""}\n${siteOrigin() ? `${siteOrigin()}/orders/${order.id}` : "Sign in to your account for details."}`, dedupeKey: `order:${order.id}:${status}` });
  });
}
