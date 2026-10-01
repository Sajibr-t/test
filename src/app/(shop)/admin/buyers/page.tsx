import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { setBuyerStatus } from "@/app/actions/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function AdminBuyersPage() {
  await requireAdmin();
  const buyers = await prisma.user.findMany({
    where: { role: "BUYER" },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand">Buyers</h1>
      <p className="mt-1 text-sm text-stone-500">
        Approve applications to unlock wholesale pricing for that business.
      </p>
      <div className="mt-6 space-y-3">
        {buyers.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl bg-white shadow-sm p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">
                  {b.businessName} <StatusBadge status={b.status} />
                </div>
                <div className="mt-0.5 text-sm text-stone-500">
                  {b.contactName} · {b.email}
                  {b.phone ? ` · ${b.phone}` : ""}
                </div>
                {b.address && (
                  <div className="text-sm text-stone-500">{b.address}</div>
                )}
                <div className="text-xs text-stone-400">
                  {b.taxId ? `Tax ID: ${b.taxId} · ` : ""}Applied{" "}
                  {formatDate(b.createdAt)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {b.status !== "APPROVED" && (
                  <form action={setBuyerStatus}>
                    <input type="hidden" name="userId" value={b.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <button className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">
                      Approve
                    </button>
                  </form>
                )}
                {b.status !== "REJECTED" && (
                  <form action={setBuyerStatus}>
                    <input type="hidden" name="userId" value={b.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <button className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                      Reject
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
        {buyers.length === 0 && (
          <p className="text-stone-500">No buyer applications yet.</p>
        )}
      </div>
    </div>
  );
}
