import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./db";
import { queueEmail, siteOrigin } from "./email";

export const passwordSchema = z.string().min(10).max(72).refine(p => Buffer.byteLength(p, "utf8") <= 72);
export const emailSchema = z.email().max(254);

// Database-backed limits apply across app instances. Keys contain hashes, not emails or IPs.
export async function rateLimit(scope: string, identity: string, limit: number, seconds: number, db: PrismaClient = prisma) {
  const now = new Date();
  const window = Math.floor(Date.now() / (seconds * 1000));
  const key = createHash("sha256").update(`${scope}:${identity}:${window}`).digest("hex");
  const row = await db.rateLimit.upsert({ where: { key }, create: { key, count: 1, expiresAt: new Date((window + 1) * seconds * 1000) }, update: { count: { increment: 1 } } });
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
  return row.count <= limit;
}

export async function issueAccountToken(userId: string, purpose: "RESET" | "VERIFY", db: PrismaClient = prisma) {
  const origin = siteOrigin();
  if (!origin) return false;
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  await db.$transaction(async tx => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    await tx.accountToken.deleteMany({ where: { userId, purpose } });
    await tx.accountToken.create({ data: { hash, userId, purpose, expiresAt: new Date(Date.now() + (purpose === "RESET" ? 3600000 : 86400000)) } });
    const path = purpose === "RESET" ? "reset-password" : "verify-email";
    await queueEmail(tx, { to: user.email, subject: purpose === "RESET" ? "Reset your Tiny Threads password" : "Verify your Tiny Threads email", text: `Open this link to ${purpose === "RESET" ? "reset your password (valid for one hour)" : "verify your email (valid for one day)"}:\n${origin}/${path}?token=${raw}\n\nIf you did not request this, you can ignore this email.`, dedupeKey: hash });
  });
  return true;
}

export async function consumeAccountToken(raw: string, purpose: "RESET" | "VERIFY", password?: string, db: PrismaClient = prisma) {
  if (!/^[a-f0-9]{64}$/.test(raw)) return false;
  if (purpose === "RESET" && !passwordSchema.safeParse(password).success) return false;
  const passwordHash = purpose === "RESET" ? await bcrypt.hash(password!, 12) : undefined;
  const hash = createHash("sha256").update(raw).digest("hex");
  return db.$transaction(async tx => {
    const token = await tx.accountToken.findUnique({ where: { hash } });
    if (!token || token.purpose !== purpose || token.expiresAt < new Date()) return false;
    const deleted = await tx.accountToken.deleteMany({ where: { hash, purpose, expiresAt: { gt: new Date() } } });
    if (deleted.count !== 1) return false;
    await tx.user.update({ where: { id: token.userId }, data: purpose === "RESET" ? { passwordHash, sessionVersion: { increment: 1 } } : { emailVerifiedAt: new Date() } });
    await tx.accountToken.deleteMany({ where: { userId: token.userId, purpose } });
    return true;
  });
}
