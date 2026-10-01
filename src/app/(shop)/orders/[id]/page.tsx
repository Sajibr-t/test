import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireApprovedBuyer } from "@/lib/session";
import { money, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrintButton } from "@/components/ui/PrintButton";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

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
  const lang = await getLang();
  const billing = order.billingSnapshot ? JSON.parse(order.billingSnapshot) as { businessName: string; contactName: string; address: string | null; email: string; taxId?: string } : order.user;
  const delivery = order.shippingSnapshot ? JSON.parse(order.shippingSnapshot) as { name: string; phone: string; address: string; city: string; postalCode: string; country: string } : null;
  const seller = order.sellerSnapshot ? JSON.parse(order.sellerSnapshot) as { businessName: string; businessAddress: string; supportEmail: string; supportPhone: string; paymentInstructions: string } : null;

  return (
    <div className="max-w-3xl">
      {query.placed && (
        <div className="mb-6 rounded-lg bg-cream px-4 py-3 text-sm font-medium text-brand print:hidden">
          {t(lang, "orders.placed")}
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row print:hidden">
        <div className="min-w-0 w-full">
          <Link href="/orders" className="text-sm text-stone-500 hover:underline">
            {t(lang, "orders.allOrders")}
          </Link>
          <h1 className="mt-1 break-all font-display text-2xl font-bold text-brand">
            {t(lang, "orders.order")} {order.orderNumber}
          </h1>
          <div className="mt-1 flex gap-2">
            <StatusBadge status={order.status} lang={lang} />
            {order.invoice && (
              <StatusBadge status={order.invoice.status} lang={lang} />
            )}
          </div>
        </div>
        <PrintButton label={t(lang, "orders.print")} />
      </div>

      {/* Invoice document — this section is what prints */}
      <div className="mt-6 rounded-2xl bg-white shadow-sm p-4 sm:p-8 print:border-0 print:p-0 [overflow-wrap:anywhere]">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row print:flex-row">
          <div className="min-w-0">
            <div className="text-xl font-bold">{seller?.businessName ?? "Tiny Threads"}</div>{seller && <p className="mt-2 whitespace-pre-line text-sm">{seller.businessAddress}<br />{seller.supportEmail} {seller.supportPhone}</p>}
            <div className="mt-1 text-sm text-stone-500">
              {t(lang, "orders.invoice").toUpperCase()}{" "}
              {order.invoice?.invoiceNumber}
            </div>
          </div>
          <div className="text-sm text-stone-600 sm:text-right print:text-right">
            {order.invoice && (
              <>
                <div>
                  {t(lang, "orders.issued")}:{" "}
                  {formatDate(order.invoice.issuedAt)}
                </div>
                <div>
                  {t(lang, "orders.due")}: {formatDate(order.invoice.dueDate)}
                </div>
                <div>
                  {t(lang, "orders.terms")}: {order.invoice.terms}
                </div>
                <div className="mt-1 font-semibold">
                  {order.invoice.status === "VOID" ? "VOID" : order.invoice.status === "PAID"
                    ? `${t(lang, "orders.paid")}${
                        order.invoice.paidAt
                          ? " " + formatDate(order.invoice.paidAt)
                          : ""
                      }`
                    : t(lang, "orders.unpaid")}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-medium text-stone-500">
            {t(lang, "orders.billTo")}
          </div>
          <div className="mt-1 font-medium">{billing.businessName}</div>
          <div>{billing.contactName}</div>
          {billing.address && (
            <div className="whitespace-pre-line">{billing.address}</div>
          )}
          <div>{billing.email}</div>{billing.taxId && <div>Tax ID: {billing.taxId}</div>}
        </div>

        {delivery && <section className="mt-5 text-sm"><h2 className="font-semibold">{lang === 'ms' ? 'Hantar kepada' : 'Ship to'}</h2><p className="whitespace-pre-line">{delivery.name}<br />{delivery.address}<br />{delivery.city} {delivery.postalCode}<br />{delivery.country}<br />{delivery.phone}</p></section>}
        {order.trackingNumber && <p className="mt-4 text-sm">{lang === 'ms' ? 'Penjejakan' : 'Tracking'}: {order.carrier} · {order.trackingNumber}</p>}
        <div className="mt-6 overflow-x-auto print:overflow-visible" role="region" aria-label={t(lang, "orders.invoice")} tabIndex={0}>
        <table className="w-full min-w-[480px] text-sm print:min-w-0 [&_td]:pr-3 [&_th]:pr-3">
          <thead>
            <tr className="border-b border-stone-300 text-left text-stone-500">
              <th className="py-2 font-medium">
                {t(lang, "orders.description")}
              </th>
              <th className="py-2 text-right font-medium">
                {t(lang, "orders.units")}
              </th>
              <th className="py-2 text-right font-medium">
                {t(lang, "orders.unitPrice")}
              </th>
              <th className="py-2 text-right font-medium">
                {t(lang, "orders.amount")}
              </th>
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
            <tr><td colSpan={3} className="pt-4 text-right">{lang === 'ms' ? 'Subjumlah' : 'Subtotal'}</td><td className="pt-4 text-right">{money(order.subtotal)}</td></tr>
            <tr><td colSpan={3} className="text-right">{lang === 'ms' ? 'Penghantaran' : 'Delivery'}</td><td className="text-right">{money(order.shippingFee)}</td></tr>
            <tr><td colSpan={3} className="text-right">{lang === 'ms' ? 'Cukai' : 'Tax'}</td><td className="text-right">{money(order.taxAmount)}</td></tr>
            <tr>
              <td colSpan={3} className="py-3 text-right font-medium">
                {t(lang, "orders.totalDue")}
              </td>
              <td className="py-3 text-right text-lg font-bold">
                {money(order.invoice?.status === "VOID" ? 0 : (order.total ?? order.subtotal))}
              </td>
            </tr>
          </tfoot>
        </table>
        </div>

        {order.notes && (
          <p className="mt-4 text-sm text-stone-600">
            <span className="font-medium">{t(lang, "orders.notes")}</span>{" "}
            {order.notes}
          </p>
        )}

        {seller?.paymentInstructions && order.invoice?.status === 'UNPAID' && <section className="mt-6 rounded bg-stone-50 p-4 text-sm"><h2 className="font-semibold">{lang === 'ms' ? 'Cara membayar' : 'How to pay'}</h2><p className="mt-2 whitespace-pre-line">{seller.paymentInstructions}</p></section>}
        {order.invoice?.status === 'VOID' && <p className="mt-5 font-semibold">{lang === 'ms' ? 'Invois dibatalkan. Tiada bayaran diperlukan.' : 'Invoice void. No payment is due.'}</p>}
        {order.invoice?.status === "UNPAID" && <p className="mt-6 text-xs text-stone-400">
          {t(lang, "orders.paymentTerms")} {order.invoice?.invoiceNumber}{" "}
          {t(lang, "orders.withPayment")}
        </p>}
      </div>
    </div>
  );
}
