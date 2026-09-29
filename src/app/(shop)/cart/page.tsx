import Link from "next/link";
import { requireApprovedBuyer } from "@/lib/session";
import { readCart, priceCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { removeFromCart, clearCart, placeOrder } from "@/app/actions/cart";

export default async function CartPage({ searchParams }: PageProps<"/cart">) {
  await requireApprovedBuyer();
  const query = await searchParams;
  const cart = await readCart();
  const priced = await priceCart(cart);

  if (priced.lines.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-brand">Your cart</h1>
        <p className="mt-4 text-stone-500">
          Cart is empty.{" "}
          <Link href="/catalog" className="underline">
            Browse the catalog
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand">Your cart</h1>

      {query.error === "moq" && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Some styles are below their minimum order quantity — see the warnings
          below.
        </div>
      )}
      {priced.moqIssues.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {priced.moqIssues.map((issue) => (
            <p key={issue.productName}>
              <strong>{issue.productName}</strong>: {issue.units} units in cart,
              minimum order is {issue.moq}. Add{" "}
              {issue.moq - issue.units} more units to order this style.
            </p>
          ))}
        </div>
      )}

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-stone-300 text-left text-stone-500">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 text-right font-medium">Units</th>
            <th className="py-2 text-right font-medium">Unit price</th>
            <th className="py-2 text-right font-medium">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {priced.lines.map((line) => (
            <tr key={line.index} className="border-b border-stone-200">
              <td className="py-3">{line.description}</td>
              <td className="py-3 text-right">{line.units}</td>
              <td className="py-3 text-right">{money(line.unitPrice)}</td>
              <td className="py-3 text-right font-medium">
                {money(line.lineTotal)}
              </td>
              <td className="py-3 pl-3 text-right">
                <form action={removeFromCart}>
                  <input type="hidden" name="index" value={line.index} />
                  <button
                    className="text-stone-400 hover:text-red-600"
                    title="Remove"
                  >
                    ✕
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="py-3 text-right font-medium">
              Subtotal
            </td>
            <td className="py-3 text-right text-lg font-semibold">
              {money(priced.subtotal)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-1 text-xs text-stone-400">
        Unit prices already include your quantity breaks. Shipping and tax are
        added to the invoice if applicable.
      </p>

      <form action={placeOrder} className="mt-8 space-y-4">
        <label className="block text-sm">
          Order notes (optional)
          <textarea
            name="notes"
            rows={2}
            placeholder="Delivery instructions, requested ship date…"
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            className="rounded bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-light disabled:opacity-40"
            disabled={priced.moqIssues.length > 0}
          >
            Place order on Net 30 terms
          </button>
          <button formAction={clearCart} className="text-sm text-stone-500 underline">
            Clear cart
          </button>
        </div>
        <p className="text-xs text-stone-400">
          Placing an order generates an invoice — no card payment is taken now.
        </p>
      </form>
    </div>
  );
}
