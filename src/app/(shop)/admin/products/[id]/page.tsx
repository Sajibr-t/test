import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { money } from "@/lib/format";
import { packLabel } from "@/lib/pricing";
import {
  updateProduct,
  addPriceBreak,
  deletePriceBreak,
  updateStock,
} from "@/app/actions/admin";

export default async function AdminProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: [{ color: "asc" }] },
      priceBreaks: { orderBy: { minQty: "asc" } },
      packs: true,
    },
  });
  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-stone-500 hover:underline"
        >
          ← All products
        </Link>
        <h1 className="mt-1 font-display text-2xl font-bold text-brand">
          {product.styleCode} — {product.name}
        </h1>
        {query.saved && (
          <p className="mt-2 rounded bg-cream px-3 py-2 text-sm font-medium text-brand">
            Saved.
          </p>
        )}
      </div>

      <section className="rounded-2xl bg-white shadow-sm p-5">
        <h2 className="font-semibold">Details</h2>
        <form action={updateProduct} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              Name
              <input
                name="name"
                defaultValue={product.name}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Category
              <input
                name="category"
                defaultValue={product.category}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            Description
            <textarea
              name="description"
              rows={2}
              defaultValue={product.description ?? ""}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="block text-sm">
              Fabric
              <input
                name="fabric"
                defaultValue={product.fabric ?? ""}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Base price
              <input
                name="basePrice"
                defaultValue={(product.basePrice / 100).toFixed(2)}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              MOQ
              <input
                name="moq"
                type="number"
                min={1}
                defaultValue={product.moq}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product.active}
            />
            Visible in catalog
          </label>
          <button className="rounded bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light">
            Save details
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white shadow-sm p-5">
        <h2 className="font-semibold">Quantity breaks</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <tr className="border-b border-stone-100">
              <td className="py-1.5">1+ units</td>
              <td className="py-1.5 text-right">{money(product.basePrice)}</td>
              <td></td>
            </tr>
            {product.priceBreaks.map((b) => (
              <tr key={b.id} className="border-b border-stone-100">
                <td className="py-1.5">{b.minQty}+ units</td>
                <td className="py-1.5 text-right">{money(b.unitPrice)}</td>
                <td className="py-1.5 pl-3 text-right">
                  <form action={deletePriceBreak}>
                    <input type="hidden" name="id" value={b.id} />
                    <input
                      type="hidden"
                      name="productId"
                      value={product.id}
                    />
                    <button className="text-stone-400 hover:text-red-600">
                      ✕
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={addPriceBreak} className="mt-4 flex items-end gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <label className="block text-sm">
            Min qty
            <input
              name="minQty"
              type="number"
              min={2}
              className="mt-1 w-24 rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Unit price
            <input
              name="unitPrice"
              placeholder="8.00"
              className="mt-1 w-28 rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <button className="rounded border border-stone-300 px-4 py-2 text-sm hover:bg-cream-dark">
            Add break
          </button>
        </form>
      </section>

      {product.packs.length > 0 && (
        <section className="rounded-2xl bg-white shadow-sm p-5">
          <h2 className="font-semibold">Prepacks</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {product.packs.map((pk) => (
              <li key={pk.id}>
                {pk.name}: {packLabel(pk.contents)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-white shadow-sm p-5">
        <h2 className="font-semibold">Variants &amp; stock</h2>
        <p className="mt-1 text-xs text-stone-400">
          Stock is informational in this version — orders are not blocked by
          stock levels.
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-left text-stone-500">
              <th className="py-2 font-medium">SKU</th>
              <th className="py-2 font-medium">Color</th>
              <th className="py-2 font-medium">Size</th>
              <th className="py-2 text-right font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-b border-stone-100">
                <td className="py-2 font-mono text-xs">{v.sku}</td>
                <td className="py-2">{v.color}</td>
                <td className="py-2">{v.size}</td>
                <td className="py-2 text-right">
                  <form
                    action={updateStock}
                    className="flex justify-end gap-2"
                  >
                    <input type="hidden" name="variantId" value={v.id} />
                    <input
                      type="hidden"
                      name="productId"
                      value={product.id}
                    />
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      className="w-20 rounded border border-stone-300 px-2 py-1 text-right"
                    />
                    <button className="text-xs text-stone-500 underline">
                      save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
