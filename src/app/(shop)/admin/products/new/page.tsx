import { requireAdmin } from "@/lib/session";
import { createProduct } from "@/app/actions/admin";

export default async function NewProductPage({
  searchParams,
}: PageProps<"/admin/products/new">) {
  await requireAdmin();
  const query = await searchParams;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-brand">Add product</h1>
      {query.error === "stylecode" && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          That style code already exists.
        </p>
      )}
      {query.error === "invalid" && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Fill in style code, name, category, base price, and at least one
          color and size.
        </p>
      )}
      <form action={createProduct} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            Style code *
            <input
              name="styleCode"
              required
              placeholder="TEE-100"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Category *
            <input
              name="category"
              required
              placeholder="T-Shirts"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Product name *
          <input
            name="name"
            required
            placeholder="Classic Crew Neck Tee"
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            name="description"
            rows={2}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-3 gap-4">
          <label className="block text-sm">
            Fabric
            <input
              name="fabric"
              placeholder="100% cotton"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Base unit price *
            <input
              name="basePrice"
              required
              placeholder="9.50"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            MOQ (units)
            <input
              name="moq"
              type="number"
              min={1}
              defaultValue={24}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            Colors * <span className="text-stone-400">(comma-separated)</span>
            <input
              name="colors"
              required
              placeholder="Black, White, Navy"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Sizes * <span className="text-stone-400">(comma-separated)</span>
            <input
              name="sizes"
              required
              placeholder="S, M, L, XL"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Quantity breaks{" "}
          <span className="text-stone-400">
            (one per line, &quot;minQty: price&quot;)
          </span>
          <textarea
            name="priceBreaks"
            rows={3}
            placeholder={"48: 8.75\n96: 8.00\n240: 7.25"}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2 font-mono"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            Prepack name
            <input
              name="packName"
              placeholder="Standard prepack"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Prepack contents{" "}
            <span className="text-stone-400">(size:qty)</span>
            <input
              name="packContents"
              placeholder="S:1, M:2, L:2, XL:1"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
        </div>
        <button className="rounded bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-light">
          Create product
        </button>
      </form>
    </div>
  );
}
