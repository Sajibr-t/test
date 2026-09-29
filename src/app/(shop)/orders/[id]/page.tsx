import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireApprovedBuyer } from "@/lib/session";
import { money, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/orders/[id]">) {
  const user = await requireApprovedBuyer();
  const { id } = await params;
  const query = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, invoice: true, user: true },
  });
  if (!order) notFound();
  if (user.role !== "ADMIN" && order.userId !== user.id) notFound();

  return (
    <div className="max-w-3xl">
      {query.placed && (
        <div className="mb-6 rounded-lg bg-cream px-4 py-3 text-sm font-medium text-brand print:hidden">
          Order placed! Your invoice is below — we&apos;ll confirm the order
          shortly.
        </div>
      )}

      <div className="flex items-start justify-between print:hidden">
        <div>
          <Link href="/orders" className="text-sm text-stone-500 hover:underline">
            ← All orders
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-brand">
            Order {order.orderNumber}
          </h1>
          <div className="mt-1 flex gap-2">
            <StatusBadge status={order.status} />
            {order.invoice && <StatusBadge status={order.invoice.status} />}
          </div>
        </div>
        <PrintButton />
      </div>

      {/* Invoice document — this section is what prints */}
      <div className="mt-6 rounded-2xl bg-white shadow-sm p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-bold">Little Sprouts — Kids Wholesale</div>
            <div className="mt-1 text-sm text-stone-500">
              INVOICE {order.invoice?.invoiceNumber}
            </div>
          </div>
          <div className="text-right text-sm text-stone-600">
            {order.invoice && (
              <>
                <div>Issued: {formatDate(order.invoice.issuedAt)}</div>
                <div>Due: {formatDate(order.invoice.dueDate)}</div>
                <div>Terms: {order.invoice.terms}</div>
                <div className="mt-1 font-semibold">
                  {order.invoice.status === "PAID"
                    ? `PAID${order.invoice.paidAt ? " " + formatDate(order.invoice.paidAt) : ""}`
                    : "UNPAID"}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-medium text-stone-500">Bill to</div>
          <div className="mt-1 font-medium">{order.user.businessName}</div>
          <div>{order.user.contactName}</div>
          {order.user.address && (
            <div className="whitespace-pre-line">{order.user.address}</div>
          )}
          <div>{order.user.email}</div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-left text-stone-500">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Units</th>
              <th className="py-2 text-right font-medium">Unit price</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-stone-100">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{money(item.unitPrice)}</td>
                <td className="py-2 text-right">{money(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right font-medium">
                Total due
              </td>
              <td className="py-3 text-right text-lg font-bold">
                {money(order.subtotal)}
              </td>
            </tr>
          </tfoot>
        </table>

        {order.notes && (
          <p className="mt-4 text-sm text-stone-600">
            <span className="font-medium">Order notes:</span> {order.notes}
          </p>
        )}

        <p className="mt-6 text-xs text-stone-400">
          Payment due within 30 days of issue. Please reference{" "}
          {order.invoice?.invoiceNumber} with your payment.
        </p>
      </div>
    </div>
  );
}
