/**
 * Authentication server actions: register, login, logout.
 *
 * Registration always creates a PENDING buyer — new accounts can sign in but
 * see the "awaiting approval" page until an admin approves them, which is what
 * keeps trade pricing away from the general public.
 *
 * Passwords are hashed with bcrypt and never stored or logged in plain text.
 * On failure these actions redirect back with an `?error=` flag rather than
 * throwing, so the form can show a friendly message.
 */
"use server";

import { redirect } from "next/navigation";
import { rateLimit, emailSchema, passwordSchema, issueAccountToken } from "@/lib/account-security";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

export async function register(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const taxId = String(formData.get("taxId") ?? "").trim() || null;

  if (!emailSchema.safeParse(email).success || !passwordSchema.safeParse(password).success || !businessName || businessName.length > 160 || !contactName || contactName.length > 120 || (phone?.length ?? 0) > 60 || (address?.length ?? 0) > 1000 || (taxId?.length ?? 0) > 100) {
    redirect("/register?error=invalid");
  }
  if (!await rateLimit("registration", "all", 30, 3600)) redirect("/register?error=rate");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/register?error=exists");

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      businessName,
      contactName,
      phone,
      address,
      taxId,
      role: "BUYER",
      status: "PENDING",
    },
  });
  await issueAccountToken(user.id, "VERIFY");
  await createSession(user.id, user.role);
  redirect("/pending");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!emailSchema.safeParse(email).success || password.length > 256 || !await rateLimit("login", email, 10, 900) || !await rateLimit("login-global", "all", 1000, 900)) redirect("/login?error=rate");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/login?error=1");
  }
  await createSession(user.id, user.role);
  if (user.role === "ADMIN") redirect("/admin");
  if (user.status !== "APPROVED") redirect("/pending");
  redirect("/catalog");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
