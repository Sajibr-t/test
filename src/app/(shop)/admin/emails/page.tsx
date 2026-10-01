import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { processEmailQueue } from "@/app/actions/email";
export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ sent?: string; failed?: string }> }) {
  await requireAdmin();
  const q = await searchParams;
  const configured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.SITE_URL);
  const messages = await prisma.emailMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, to: true, subject: true, status: true, attempts: true, lastError: true } });
  return <div className="max-w-4xl"><Link href="/admin" className="underline">Admin dashboard</Link><h1 className="mt-3 text-3xl">Email queue</h1><p className="mt-3">{configured ? "Delivery is configured. Your scheduled worker can process this queue." : "Set RESEND_API_KEY, EMAIL_FROM and SITE_URL on the server to deliver queued messages."}</p>{q.sent !== undefined && <p role="status" className="mt-3">Sent: {q.sent}. Failed: {q.failed}.</p>}<form action={processEmailQueue}><button disabled={!configured} className="shop-button mt-5">Send up to 10 queued emails</button></form><div className="mt-6 space-y-3">{messages.map(m => <article key={m.id} className="rounded-xl bg-white p-4"><h2 className="font-semibold">{m.subject}</h2><p className="text-sm">{m.to} · {m.status} · {m.attempts} attempts</p>{m.lastError && <p className="mt-2 text-sm text-red-800">{m.lastError}</p>}</article>)}{!messages.length && <p>No queued emails.</p>}</div></div>;
}
