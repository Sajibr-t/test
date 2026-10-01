/**
 * Admin server actions: approving buyers, managing the catalogue, and
 * progressing orders and invoices.
 *
 * Every action starts with `requireAdmin()` — these are public HTTP endpoints,
 * so the check has to live here rather than relying on the admin UI being
 * hidden from other users.
 *
 * Prices arrive as text from form inputs and are converted to integer cents by
 * `parseMoney()`; a null result means the input was invalid and we redirect
 * back instead of writing a bad price.
 */
"use server";

import { queueEmail } from "@/lib/email";
import { randomUUID } from "node:crypto";
import { changeOrderStatus, OrderError } from "@/lib/order-service";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { parseMoney } from "@/lib/format";

export async function setBuyerStatus(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  const status = String(formData.get("status"));
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) redirect("/admin/buyers");
  await prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({where: {id: userId}});
    if (!user || user.role !== 'BUYER' || user.status === status) return;
    await tx.user.update({where: {id: userId}, data: {status}});
    await queueEmail(tx, {to:user.email, subject:'Your Tiny Threads trade application', text: 'Your trade account status is now ' + status.toLowerCase() + '. Sign in to your account for details.', dedupeKey:'buyer:' + user.id + ':' + randomUUID()});
  });
  redirect("/admin/buyers");
}

// colors: "Black, White"  sizes: "S, M, L, XL"
// priceBreaks: one per line, "50: 8.50"
// packContents: "S:1, M:2, L:2, XL:1"
export async function createProduct(formData: FormData) {
  await requireAdmin();
  const styleCode = String(formData.get("styleCode") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const fabric = String(formData.get("fabric") ?? "").trim() || null;
  const basePrice = parseMoney(String(formData.get("basePrice") ?? ""));
  const moq = Number(formData.get("moq") ?? 1);
  const colors = String(formData.get("colors") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const sizes = String(formData.get("sizes") ?? "")
    .split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

  if (!styleCode || !name || !category || basePrice === null || !Number.isSafeInteger(moq) || moq < 1 || moq > 100000 || colors.length === 0 || sizes.length === 0 || colors.length * sizes.length > 500 || new Set(colors).size !== colors.length || new Set(sizes).size !== sizes.length) {
    redirect("/admin/products/new?error=invalid");
  }
  if (await prisma.product.findUnique({ where: { styleCode } })) {
    redirect("/admin/products/new?error=stylecode");
  }

  const priceBreaks: { minQty: number; unitPrice: number }[] = [];
  for (const line of String(formData.get("priceBreaks") ?? "").split("\n")) {
    if (!line.trim()) continue;
    const m = line.trim().match(/^(\d+)\s*:\s*(.+)$/);
    if (!m) redirect("/admin/products/new?error=invalid");
    const minQty = Number(m[1]);
    const unitPrice = parseMoney(m[2]);
    if (!Number.isSafeInteger(minQty) || minQty < 1 || minQty > 100000 || unitPrice === null || priceBreaks.some(b => b.minQty === minQty)) redirect("/admin/products/new?error=invalid");
    priceBreaks.push({ minQty, unitPrice });
  }

  let pack: { name: string; contents: string } | null = null;
  const packContentsRaw = String(formData.get("packContents") ?? "").trim();
  if (packContentsRaw) {
    const contents: Record<string, number> = {};
    for (const part of packContentsRaw.split(",")) {
      const m = part.trim().match(/^([A-Za-z0-9-]+)\s*:\s*([1-9]\d*)$/);
      if (!m || !sizes.includes(m[1].toUpperCase()) || Number(m[2]) > 1000) redirect("/admin/products/new?error=invalid");
      contents[m[1].toUpperCase()] = Number(m[2]);
    }
    if (Object.keys(contents).length > 0) {
      pack = {
        name: String(formData.get("packName") ?? "").trim() || "Prepack",
        contents: JSON.stringify(contents),
      };
    }
  }

  const product = await prisma.product.create({
    data: {
      styleCode,
      name,
      category,
      description,
      fabric,
      basePrice,
      moq,
      variants: {
        create: colors.flatMap((color) =>
          sizes.map((size) => ({
            color,
            size,
            sku: `${styleCode}-${color.replace(/\s+/g, "").toUpperCase()}-${size}`,
          }))
        ),
      },
      priceBreaks: { create: priceBreaks },
      ...(pack ? { packs: { create: [pack] } } : {}),
    },
  });
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const basePrice = parseMoney(String(formData.get("basePrice") ?? ""));
  const moq = Number(formData.get("moq"));
  if (basePrice === null || !Number.isSafeInteger(moq) || moq < 1 || moq > 100000 || !String(formData.get("name") ?? "").trim() || !String(formData.get("category") ?? "").trim()) redirect(`/admin/products/${id}?error=price`);
  await prisma.product.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      fabric: String(formData.get("fabric") ?? "").trim() || null,
      basePrice,
      moq,
      nameMs: String(formData.get("nameMs") ?? "").trim() || null,
      descriptionMs: String(formData.get("descriptionMs") ?? "").trim() || null,
      active: formData.get("active") === "on",
    },
  });
  redirect(`/admin/products/${id}?saved=1`);
}

export async function addPriceBreak(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const minQty = Number(formData.get("minQty") ?? 0);
  const unitPrice = parseMoney(String(formData.get("unitPrice") ?? ""));
  if (!Number.isSafeInteger(minQty) || minQty < 1 || minQty > 100000 || unitPrice === null) redirect(`/admin/products/${productId}?error=price`);
  if (Number.isSafeInteger(minQty) && minQty > 0 && minQty <= 100000 && unitPrice !== null) {
    await prisma.priceBreak.upsert({
      where: { productId_minQty: { productId, minQty } },
      create: { productId, minQty, unitPrice },
      update: { unitPrice },
    });
  }
  redirect(`/admin/products/${productId}`);
}

export async function deletePriceBreak(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  await prisma.priceBreak.delete({ where: { id } });
  redirect(`/admin/products/${productId}`);
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const variantId = String(formData.get("variantId"));
  const productId = String(formData.get("productId"));
  const stock = Number(formData.get("stock"));
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1000000) redirect(`/admin/products/${productId}?error=stock`);
  const expectedStock = Number(formData.get('expectedStock'));
  if (!Number.isSafeInteger(expectedStock) || expectedStock < 0) redirect(`/admin/products/${productId}?error=stock`);
  const result = await prisma.variant.updateMany({ where: { id: variantId, productId, stock: expectedStock }, data: { stock } });
  if (!result.count) redirect(`/admin/products/${productId}?error=stock-changed`);
  redirect(`/admin/products/${productId}`);
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  if (["PENDING", "CONFIRMED", "SHIPPED", "CANCELLED"].includes(status)) {
    try { await changeOrderStatus(orderId, status, prisma, { carrier: String(formData.get("carrier") ?? "").trim(), trackingNumber: String(formData.get("trackingNumber") ?? "").trim() }); } catch (error) {
      if (error instanceof OrderError) redirect("/admin/orders?error=" + error.message);
      throw error;
    }
  }
  redirect("/admin/orders");
}

export async function markInvoicePaid(formData: FormData) {
  await requireAdmin();
  const invoiceId = String(formData.get("invoiceId"));
  await prisma.invoice.updateMany({
    where: { id: invoiceId, status: "UNPAID", order: { status: { not: "CANCELLED" } } },
    data: { status: "PAID", paidAt: new Date() },
  });
  redirect("/admin/orders");
}
