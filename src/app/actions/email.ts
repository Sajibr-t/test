"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { deliverEmails } from "@/lib/email";
export async function processEmailQueue() {
  await requireAdmin();
  const result = await deliverEmails();
  redirect(`/admin/emails?sent=${result.sent}&failed=${result.failed}`);
}
