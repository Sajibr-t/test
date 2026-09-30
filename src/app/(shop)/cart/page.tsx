import Link from "next/link";
import { requireApprovedBuyer } from "@/lib/session";
import { readCart, priceCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { removeFromCart, clearCart, placeOrder } from "@/app/actions/cart";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function CartPage({ searchParams }: PageProps<"/cart">) {
  await requireApprovedBuyer();
  const query = await searchParams;
  const cart = await readCart();
  const lang = await getLang();
  const priced = await priceCart(cart, lang);

  if (priced.lines.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-brand">
          {t(lang, "cart.title")}
        </h1>
        <p className="mt-4 text-stone-500">
          {t(lang, "cart.empty")}{" "}
          <Link href="/catalog" className="underline">
            {t(lang, "cart.browse")}
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand">
        {t(lang, "cart.title")}
      </h1>

      {query.error === "moq" && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {t(lang, "cart.moqError")}
        </div>
      )}
      {priced.moqIssues.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {priced.moqIssues.map((issue) => (
            <p key={issue.productName}>
              <strong>{issue.productName}</strong>: {issue.units}{" "}
              {t(lang, "cart.unitsInCart")} {issue.moq}.{" "}
              {t(lang, "cart.addMore")} {issue.moq - issue.units}{" "}
              {t(lang, "cart.moreUnits")}
            </p>
          ))}
        </div>
      )}

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-stone-300 text-left text-stone-500">
            <th className="py-2 font-medium">{t(lang, "cart.item")}</th>
            <th className="py-2 text-right font-medium">
              {t(lang, "cart.units")}
            </th>
            <th className="py-2 text-right font-medium">
              {t(lang, "cart.unitPrice")}
            </th>
            <th className="py-2 text-right font-medium">
              {t(lang, "cart.total")}
            </th>
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
                    title={t(lang, "cart.remove")}
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
              {t(lang, "cart.subtotal")}
            </td>
            <td className="py-3 text-right text-lg font-semibold">
              {money(priced.subtotal)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-1 text-xs text-stone-400">
        {t(lang, "cart.pricesNote")}
      </p>

      <form action={placeOrder} className="mt-8 space-y-4">
        <label className="block text-sm">
          {t(lang, "cart.notes")}
          <textarea
            name="notes"
            rows={2}
            placeholder={t(lang, "cart.notesPlaceholder")}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            className="rounded bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-light disabled:opacity-40"
            disabled={priced.moqIssues.length > 0}
          >
            {t(lang, "cart.placeOrder")}
          </button>
          <button formAction={clearCart} className="text-sm text-stone-500 underline">
            {t(lang, "cart.clear")}
          </button>
        </div>
        <p className="text-xs text-stone-400">
          {t(lang, "cart.invoiceNote")}
        </p>
      </form>
    </div>
  );
}
