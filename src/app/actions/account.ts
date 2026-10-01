"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, destroySession } from "@/lib/session";
import { consumeAccountToken, issueAccountToken, passwordSchema, emailSchema, rateLimit } from "@/lib/account-security";

export async function updateProfile(form: FormData) {
  const user = await requireUser();
  const result = z.object({ businessName: z.string().trim().min(2).max(160), contactName: z.string().trim().min(2).max(120), phone: z.string().trim().max(60), address: z.string().trim().max(1000), taxId: z.string().trim().max(100) }).safeParse(Object.fromEntries(form));
  if (!result.success) redirect("/account?error=profile");
  await prisma.user.update({ where: { id: user.id }, data: result.data });
  redirect("/account?saved=1");
}
export async function changePassword(form: FormData) {
  const user = await requireUser();
  if (!await rateLimit("change-password", user.id, 5, 900)) redirect("/account?error=rate");
  const next = String(form.get("password") ?? "");
  if (!passwordSchema.safeParse(next).success || !(await bcrypt.compare(String(form.get("currentPassword") ?? ""), user.passwordHash))) redirect("/account?error=password");
  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12), sessionVersion: { increment: 1 } } });
    await tx.accountToken.deleteMany({ where: { userId: user.id, purpose: "RESET" } });
  });
  await destroySession();
  redirect("/login?reset=1");
}
export async function requestPasswordReset(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (emailSchema.safeParse(email).success && await rateLimit("reset", email, 3, 3600) && await rateLimit("reset-global", "all", 100, 3600)) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) await issueAccountToken(user.id, "RESET");
  }
  redirect("/forgot-password?sent=1");
}
export async function resetPassword(form: FormData) {
  const raw = String(form.get("token") ?? "");
  if (!await rateLimit("reset-consume", raw.slice(0, 64), 5, 900)) redirect("/forgot-password?error=invalid");
  if (!await consumeAccountToken(raw, "RESET", String(form.get("password") ?? ""))) redirect("/forgot-password?error=invalid");
  await destroySession();
  redirect("/login?reset=1");
}
export async function requestVerification() {
  const user = await requireUser();
  if (!user.emailVerifiedAt && await rateLimit("verify", user.id, 3, 3600)) await issueAccountToken(user.id, "VERIFY");
  redirect("/account?verification=1");
}
export async function verifyEmail(form: FormData) {
  const ok = await consumeAccountToken(String(form.get("token") ?? ""), "VERIFY");
  redirect(ok ? "/account?verified=1" : "/verify-email?error=invalid");
}
