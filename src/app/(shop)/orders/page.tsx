import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireApprovedBuyer } from "@/lib/session";
import { money, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function OrdersPage() {
  const user = await requireApprovedBuyer();
  const orders = await prisma.order.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    include: { invoice: true },
    orderBy: { createdAt: "desc" },
  });
  const lang = await getLang();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand">
        {t(lang, "orders.title")}
      </h1>
      {orders.length === 0 ? (
        <p className="mt-4 text-stone-500">
          {t(lang, "orders.none")}{" "}
          <Link href="/catalog" className="underline">
            {t(lang, "cart.browse")}
          </Link>
          .
        </p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-left text-stone-500">
              <th className="py-2 font-medium">{t(lang, "orders.order")}</th>
              <th className="py-2 font-medium">{t(lang, "orders.date")}</th>
              <th className="py-2 font-medium">{t(lang, "orders.status")}</th>
              <th className="py-2 font-medium">{t(lang, "orders.invoice")}</th>
              <th className="py-2 text-right font-medium">
                {t(lang, "orders.total")}
              </th>
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
                  <StatusBadge status={o.status} lang={lang} />
                </td>
                <td className="py-3">
                  {o.invoice ? (
                    <StatusBadge status={o.invoice.status} lang={lang} />
                  ) : (
                    "—"
                  )}
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
