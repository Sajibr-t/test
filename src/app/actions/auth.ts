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

  if (!email || !email.includes("@") || password.length < 8 || !businessName || !contactName) {
    redirect("/register?error=invalid");
  }
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
  await createSession(user.id, user.role);
  redirect("/pending");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
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
