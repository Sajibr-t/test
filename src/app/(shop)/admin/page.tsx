import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { money } from "@/lib/format";

export default async function AdminDashboard() {
  await requireAdmin();
  const [pendingBuyers, pendingOrders, unpaidInvoices, productCount, revenue] =
    await Promise.all([
      prisma.user.count({ where: { role: "BUYER", status: "PENDING" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.invoice.count({ where: { status: "UNPAID" } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.aggregate({
        _sum: { subtotal: true },
        where: { status: { not: "CANCELLED" } },
      }),
    ]);

  const cards = [
    {
      label: "Buyer applications awaiting review",
      value: pendingBuyers,
      href: "/admin/buyers",
    },
    {
      label: "Orders awaiting confirmation",
      value: pendingOrders,
      href: "/admin/orders",
    },
    {
      label: "Unpaid invoices",
      value: unpaidInvoices,
      href: "/admin/orders",
    },
    {
      label: "Active products",
      value: productCount,
      href: "/admin/products",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand">Admin dashboard</h1>
      <p className="mt-1 text-sm text-stone-500">
        Total ordered (excl. cancelled): {money(revenue._sum.subtotal ?? 0)}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl bg-white shadow-sm p-5 transition hover:border-stone-400"
          >
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="mt-1 text-sm text-stone-500">{c.label}</div>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/emails" className="shop-button">Email queue</Link><Link href="/admin/settings" className="shop-button">Store settings</Link>
        <Link
          href="/admin/products/new"
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          + Add product
        </Link>
        <Link
          href="/catalog"
          className="rounded border border-stone-300 px-4 py-2 text-sm hover:bg-cream-dark"
        >
          View store as buyer
        </Link>
      </div>
    </div>
  );
}
