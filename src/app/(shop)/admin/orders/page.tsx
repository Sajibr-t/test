import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { money, formatDate } from "@/lib/format";
import { setOrderStatus, markInvoicePaid } from "@/app/actions/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: { user: true, invoice: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand">Orders</h1>
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="rounded-2xl bg-white shadow-sm p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link
                  href={`/orders/${o.id}`}
                  className="font-medium underline"
                >
                  {o.orderNumber}
                </Link>{" "}
                <StatusBadge status={o.status} />{" "}
                {o.invoice && <StatusBadge status={o.invoice.status} />}
                <div className="mt-0.5 text-sm text-stone-500">
                  {o.user.businessName} · {formatDate(o.createdAt)} ·{" "}
                  <span className="font-medium text-stone-700">
                    {money(o.subtotal)}
                  </span>
                  {o.invoice ? ` · ${o.invoice.invoiceNumber}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={setOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="orderId" value={o.id} />
                  <select
                    name="status"
                    defaultValue={o.status}
                    className="rounded border border-stone-300 px-2 py-1.5 text-sm"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <button className="rounded border border-stone-300 px-3 py-1.5 text-sm hover:bg-cream-dark">
                    Update
                  </button>
                </form>
                {o.invoice && o.invoice.status === "UNPAID" && (
                  <form action={markInvoicePaid}>
                    <input
                      type="hidden"
                      name="invoiceId"
                      value={o.invoice.id}
                    />
                    <button className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">
                      Mark paid
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-stone-500">No orders yet.</p>}
      </div>
    </div>
  );
}
