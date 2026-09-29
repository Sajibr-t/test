import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { money } from "@/lib/format";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: { variants: true, priceBreaks: true, packs: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          + Add product
        </Link>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-stone-300 text-left text-stone-500">
            <th className="py-2 font-medium">Style</th>
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Category</th>
            <th className="py-2 text-right font-medium">Base price</th>
            <th className="py-2 text-right font-medium">MOQ</th>
            <th className="py-2 text-right font-medium">Variants</th>
            <th className="py-2 text-right font-medium">Active</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-stone-200">
              <td className="py-3">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-medium underline"
                >
                  {p.styleCode}
                </Link>
              </td>
              <td className="py-3">{p.name}</td>
              <td className="py-3">{p.category}</td>
              <td className="py-3 text-right">{money(p.basePrice)}</td>
              <td className="py-3 text-right">{p.moq}</td>
              <td className="py-3 text-right">{p.variants.length}</td>
              <td className="py-3 text-right">{p.active ? "✓" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <p className="mt-4 text-stone-500">No products yet — add your first.</p>
      )}
    </div>
  );
}
