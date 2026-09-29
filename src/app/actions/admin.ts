"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { parseMoney } from "@/lib/format";

export async function setBuyerStatus(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  const status = String(formData.get("status"));
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) redirect("/admin/buyers");
  await prisma.user.update({ where: { id: userId }, data: { status } });
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
  const moq = Math.max(1, Math.floor(Number(formData.get("moq") ?? 1)));
  const colors = String(formData.get("colors") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const sizes = String(formData.get("sizes") ?? "")
    .split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

  if (!styleCode || !name || !category || basePrice === null || colors.length === 0 || sizes.length === 0) {
    redirect("/admin/products/new?error=invalid");
  }
  if (await prisma.product.findUnique({ where: { styleCode } })) {
    redirect("/admin/products/new?error=stylecode");
  }

  const priceBreaks: { minQty: number; unitPrice: number }[] = [];
  for (const line of String(formData.get("priceBreaks") ?? "").split("\n")) {
    const m = line.trim().match(/^(\d+)\s*:\s*(.+)$/);
    if (!m) continue;
    const unitPrice = parseMoney(m[2]);
    if (unitPrice !== null) priceBreaks.push({ minQty: Number(m[1]), unitPrice });
  }

  let pack: { name: string; contents: string } | null = null;
  const packContentsRaw = String(formData.get("packContents") ?? "").trim();
  if (packContentsRaw) {
    const contents: Record<string, number> = {};
    for (const part of packContentsRaw.split(",")) {
      const m = part.trim().match(/^([A-Za-z0-9]+)\s*:\s*(\d+)$/);
      if (m) contents[m[1].toUpperCase()] = Number(m[2]);
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
  if (basePrice === null) redirect(`/admin/products/${id}?error=price`);
  await prisma.product.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      fabric: String(formData.get("fabric") ?? "").trim() || null,
      basePrice,
      moq: Math.max(1, Math.floor(Number(formData.get("moq") ?? 1))),
      active: formData.get("active") === "on",
    },
  });
  redirect(`/admin/products/${id}?saved=1`);
}

export async function addPriceBreak(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const minQty = Math.floor(Number(formData.get("minQty") ?? 0));
  const unitPrice = parseMoney(String(formData.get("unitPrice") ?? ""));
  if (minQty > 0 && unitPrice !== null) {
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
  const stock = Math.max(0, Math.floor(Number(formData.get("stock") ?? 0)));
  await prisma.variant.update({ where: { id: variantId }, data: { stock } });
  redirect(`/admin/products/${productId}`);
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  if (["PENDING", "CONFIRMED", "SHIPPED", "CANCELLED"].includes(status)) {
    await prisma.order.update({ where: { id: orderId }, data: { status } });
  }
  redirect("/admin/orders");
}

export async function markInvoicePaid(formData: FormData) {
  await requireAdmin();
  const invoiceId = String(formData.get("invoiceId"));
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", paidAt: new Date() },
  });
  redirect("/admin/orders");
}
