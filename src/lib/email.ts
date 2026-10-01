import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

export function siteOrigin() {
  const value = process.env.SITE_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && url.hostname === "localhost")) return null;
    return url.origin;
  } catch { return null; }
}

export function queueEmail(db: Pick<Prisma.TransactionClient, "emailMessage">, message: { to: string; subject: string; text: string; dedupeKey: string }) {
  return db.emailMessage.upsert({ where: { dedupeKey: message.dedupeKey }, create: message, update: {} });
}

// Called by a protected worker endpoint or explicitly from the admin queue.
// Missing credentials keep messages queued; checkout never depends on the provider.
export async function deliverEmails() {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return { sent: 0, failed: 0, configured: false };
  const now = new Date();
  const messages = await prisma.emailMessage.findMany({ where: { status: { in: ["PENDING", "FAILED", "SENDING"] }, attempts: { lt: 5 }, OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] }, orderBy: { createdAt: "asc" }, take: 10 });
  let sent = 0, failed = 0;
  for (const message of messages) {
    if (message.attempts > 0 && message.createdAt.getTime() < Date.now() - 23 * 3600000) {
      await prisma.emailMessage.update({where: {id: message.id}, data: {status: 'REVIEW', lastError: 'Delivery retry window expired. Check the provider delivery log before sending again.'}});
      continue;
    }
    const claim = await prisma.emailMessage.updateMany({ where: { id: message.id, status: message.status, attempts: message.attempts, OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] }, data: { status: "SENDING", attempts: { increment: 1 }, lockedUntil: new Date(Date.now() + 120000) } });
    if (!claim.count) continue;
    try {
      // Resend deduplicates retries for 24h. Do not automatically retry an uncertain delivery beyond that window.
      if (message.status === "SENDING" && message.createdAt.getTime() < Date.now() - 23 * 3600000) throw new Error("Review uncertain delivery before retrying");
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": message.id }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [message.to], subject: message.subject, text: message.text }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
      // Remove token-bearing bodies after delivery; the queue is not a permanent customer-data archive.
      await prisma.emailMessage.update({ where: { id: message.id }, data: { status: "SENT", sentAt: new Date(), text: "", lastError: null, lockedUntil: null } });
      sent++;
    } catch (error) {
      await prisma.emailMessage.update({ where: { id: message.id }, data: { status: "FAILED", lastError: error instanceof Error ? error.message : "Delivery failed", lockedUntil: new Date(Date.now() + 60000) } });
      failed++;
    }
  }
  return { sent, failed, configured: true };
}
