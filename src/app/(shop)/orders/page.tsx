import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireApprovedBuyer } from "@/lib/session";
import { money, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function OrdersPage() {
  const user = await requireApprovedBuyer();
  const orders = await prisma.order.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    include: { invoice: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand">Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-4 text-stone-500">
          No orders yet.{" "}
          <Link href="/catalog" className="underline">
            Browse the catalog
          </Link>
          .
        </p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-left text-stone-500">
              <th className="py-2 font-medium">Order</th>
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Invoice</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-stone-200">
                <td className="py-3">
                  <Link
                    href={`/orders/${o.id}`}
                    className="font-medium underline"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="py-3">{formatDate(o.createdAt)}</td>
                <td className="py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="py-3">
                  {o.invoice ? <StatusBadge status={o.invoice.status} /> : "—"}
                </td>
                <td className="py-3 text-right font-medium">
                  {money(o.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
