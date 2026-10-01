import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

export const settingsSchema = z.object({
  businessName: z.string().trim().max(160).default("Tiny Threads"),
  businessAddress: z.string().trim().max(1000).default(""),
  supportEmail: z.union([z.email(), z.literal("")]).default(""),
  supportPhone: z.string().trim().max(80).default(""),
  paymentInstructions: z.string().trim().max(3000).default(""),
  shippingCountries: z.array(z.string().trim().min(2).max(80)).max(50).default([]),
  shippingFee: z.number().int().min(0).max(10000000).default(0),
  taxBasisPoints: z.number().int().min(0).max(10000).default(0),
  checkoutEnabled: z.boolean().default(false),
  deliveryPolicy: z.string().trim().max(12000).default(""),
  returnsPolicy: z.string().trim().max(12000).default(""),
  privacyPolicy: z.string().trim().max(20000).default(""),
  terms: z.string().trim().max(20000).default(""),
});
export type StoreSettings = z.infer<typeof settingsSchema>;
export async function getStoreSettings(db: Pick<Prisma.TransactionClient, "storeSettings"> = prisma): Promise<StoreSettings> {
  const record = await db.storeSettings.findUnique({ where: { id: "store" } });
  return settingsSchema.parse(record ? JSON.parse(record.value) : {});
}
export function checkoutReady(s: StoreSettings) {
  return s.checkoutEnabled && !!s.businessName && !!s.businessAddress && !!s.supportEmail && !!s.paymentInstructions && s.shippingCountries.length > 0;
}
export const deliverySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(60),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(2).max(30),
  country: z.string().trim().min(2).max(80),
});
export function orderTotals(subtotal: number, s: Pick<StoreSettings, "shippingFee" | "taxBasisPoints">) {
  // Configured tax applies to merchandise plus shipping. Confirm local treatment before enabling checkout.
  const taxAmount = Math.round((subtotal + s.shippingFee) * s.taxBasisPoints / 10000);
  return { shippingFee: s.shippingFee, taxAmount, total: subtotal + s.shippingFee + taxAmount };
}
