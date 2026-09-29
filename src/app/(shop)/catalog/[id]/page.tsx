import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { packLabel, packUnits } from "@/lib/pricing";
import { productImage } from "@/lib/display";
import { addToCart } from "@/app/actions/cart";

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/catalog/[id]">) {
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
  if (!product || !product.active) notFound();

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.map((v) => v.size))];

  return (
    <div className="space-y-8">
      {query.added && (
        <div className="rounded-lg bg-cream px-4 py-3 text-sm font-medium text-brand">
          Added to cart.{" "}
          <Link href="/cart" className="font-medium underline">
            View cart
          </Link>{" "}
          or keep browsing.
        </div>
      )}
      {query.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t add that to the cart — check your selection.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {productImage(product.styleCode) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={productImage(product.styleCode)!}
            alt={product.name}
            className="h-72 w-full rounded-2xl object-cover shadow-sm md:h-80"
          />
        )}
        <div>
          <Link href="/catalog" className="text-sm text-stone-500 hover:underline">
            ← Back to catalog
          </Link>
          <div className="mt-2 text-xs uppercase tracking-wide text-stone-400">
            {product.category} · {product.styleCode}
          </div>
          <h1 className="font-display text-3xl font-bold text-brand">{product.name}</h1>
          {product.description && (
            <p className="mt-2 max-w-2xl text-stone-600">{product.description}</p>
          )}
          {product.fabric && (
            <p className="mt-1 text-sm text-stone-500">Fabric: {product.fabric}</p>
          )}
          <p className="mt-2 text-sm font-medium text-stone-700">
            Minimum order: {product.moq} units
          </p>
        </div>
      </div>

      <section className="max-w-md rounded-2xl bg-white shadow-sm p-5">
        <h2 className="font-semibold">Wholesale pricing</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <tr className="border-b border-stone-100">
              <td className="py-1.5">1+ units</td>
              <td className="py-1.5 text-right font-medium">
                {money(product.basePrice)} / unit
              </td>
            </tr>
            {product.priceBreaks.map((b) => (
              <tr key={b.id} className="border-b border-stone-100">
                <td className="py-1.5">{b.minQty}+ units</td>
                <td className="py-1.5 text-right font-medium">
                  {money(b.unitPrice)} / unit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-stone-400">
          Breaks apply to the total units of this style in your cart, packs and
          loose sizes combined.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {product.packs.length > 0 && (
          <section className="rounded-2xl bg-white shadow-sm p-5">
            <h2 className="font-semibold">Order prepacks</h2>
            <p className="mt-1 text-sm text-stone-500">
              Fixed size runs — the fastest way to hit quantity breaks.
            </p>
            <form action={addToCart} className="mt-4 space-y-3">
              <input type="hidden" name="productId" value={product.id} />
              <label className="block text-sm">
                Prepack
                <select
                  name="packId"
                  className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
                >
                  {product.packs.map((pk) => (
                    <option key={pk.id} value={pk.id}>
                      {pk.name} ({packLabel(pk.contents)} —{" "}
                      {packUnits(pk.contents)} units)
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Color
                <select
                  name="color"
                  className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
                >
                  {colors.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Number of packs
                <input
                  name="qty"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
                />
              </label>
              <button className="w-full rounded bg-brand py-2 font-medium text-white hover:bg-brand-light">
                Add packs to cart
              </button>
            </form>
          </section>
        )}

        <section className="rounded-2xl bg-white shadow-sm p-5">
          <h2 className="font-semibold">Order individual sizes</h2>
          <p className="mt-1 text-sm text-stone-500">
            Top up specific sizes and colors.
          </p>
          <form action={addToCart} className="mt-4 space-y-3">
            <input type="hidden" name="productId" value={product.id} />
            <label className="block text-sm">
              Color
              <select
                name="color"
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              >
                {colors.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Size
              <select
                name="size"
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              >
                {sizes.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Units
              <input
                name="qty"
                type="number"
                min={1}
                defaultValue={10}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              />
            </label>
            <button className="w-full rounded bg-brand py-2 font-medium text-white hover:bg-brand-light">
              Add units to cart
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
