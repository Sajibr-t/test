"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function uploadProductImage(form: FormData) {
  await requireAdmin();
  const productId = String(form.get("productId") ?? "");
  const file = form.get("image");
  if (!(file instanceof File) || !file.size || file.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) redirect(`/admin/products/${productId}?error=image`);
  let data: Buffer;
  try {
    data = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 20000000, animated: false }).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch { redirect(`/admin/products/${productId}?error=image`); }
  await prisma.$transaction(async tx => {
    await tx.productImage.upsert({ where: { productId }, create: { productId, data: new Uint8Array(data) }, update: { data: new Uint8Array(data) } });
    await tx.product.update({ where: { id: productId }, data: { imageUrl: `/product-images/${productId}?v=${randomUUID()}` } });
  });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}
export async function addVariant(form: FormData) {
  await requireAdmin();
  const productId = String(form.get("productId") ?? "");
  const result = z.object({ color: z.string().trim().min(1).max(80), size: z.string().trim().min(1).max(40), sku: z.string().trim().min(1).max(120), stock: z.coerce.number().int().min(0).max(1000000) }).safeParse(Object.fromEntries(form));
  if (!result.success) redirect(`/admin/products/${productId}?error=variant`);
  try { await prisma.variant.create({ data: { productId, ...result.data } }); }
  catch (error) { if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') redirect(`/admin/products/${productId}?error=duplicate`); throw error; }
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}
export async function savePack(form: FormData) {
  await requireAdmin();
  const productId = String(form.get("productId") ?? "");
  const id = String(form.get("packId") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const raw = String(form.get("contents") ?? "");
  const contents: Record<string, number> = {};
  for (const part of raw.split(',')) {
    const match = part.trim().match(/^([A-Za-z0-9-]+)\s*:\s*([1-9]\d*)$/);
    if (!match || Number(match[2]) > 1000 || contents[match[1]]) redirect(`/admin/products/${productId}?error=pack`);
    contents[match[1]] = Number(match[2]);
  }
  const variants = await prisma.variant.findMany({ where: { productId } });
  const colors = [...new Set(variants.map(v => v.color))];
  if (!name || name.length > 100 || !colors.some(color => Object.keys(contents).every(size => variants.some(v => v.color === color && v.size === size)))) redirect(`/admin/products/${productId}?error=pack`);
  if (id) await prisma.pack.update({ where: { id, productId }, data: { name, contents: JSON.stringify(contents) } });
  else await prisma.pack.create({ data: { productId, name, contents: JSON.stringify(contents) } });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}
