"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { settingsSchema, checkoutReady } from "@/lib/store-settings";
import { parseMoney } from "@/lib/format";

export async function saveSettings(form: FormData) {
  await requireAdmin();
  const result = settingsSchema.safeParse({ ...Object.fromEntries(form),
    shippingCountries: String(form.get("shippingCountries") ?? "").split(",").map(s => s.trim()).filter(Boolean),
    shippingFee: parseMoney(String(form.get("shippingFee"))),
    taxBasisPoints: Math.round(Number(form.get("taxPercent")) * 100),
    checkoutEnabled: form.get("checkoutEnabled") === "on",
  });
  if (!result.success || (result.data.checkoutEnabled && !checkoutReady(result.data))) redirect("/admin/settings?error=invalid");
  await prisma.storeSettings.upsert({ where: { id: "store" }, create: { id: "store", value: JSON.stringify(result.data) }, update: { value: JSON.stringify(result.data) } });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
