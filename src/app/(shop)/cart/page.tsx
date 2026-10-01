import { getStoreSettings, checkoutReady, orderTotals } from "@/lib/store-settings";
import { randomUUID } from "node:crypto";
import SubmitButton from "@/components/ui/SubmitButton";
import Link from "next/link";
import { requireApprovedBuyer } from "@/lib/session";
import { readCart, priceCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { removeFromCart, clearCart, placeOrder, updateCartQuantity } from "@/app/actions/cart";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { shopCopy } from "@/lib/shop-copy";

export default async function CartPage({ searchParams }: PageProps<"/cart">) {
  const user = await requireApprovedBuyer();
  const settings = await getStoreSettings();
  const ready = checkoutReady(settings);
  const [query, cart, lang] = await Promise.all([searchParams, readCart(), getLang()]);
  const priced = await priceCart(cart, lang);
  const c = shopCopy(lang);
  const totals = orderTotals(priced.subtotal, settings);
  const errors: Record<string,string> = { delivery: 'Complete the delivery address and choose a supported country.', setup: 'Ordering is not open yet. Please contact the store.', stock: 'Some quantities are no longer available. Review the stock information below.', moq: 'Meet the minimum quantity for each style before ordering.', total: 'This order exceeds the online order limit. Please contact the store.', retry: 'We could not complete the request. Check your order history, then try again.' };
  return <div className="mx-auto max-w-6xl">
    <Link href="/catalog" className="text-sm text-stone-500 hover:underline">&larr; {c.continue}</Link>
    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{c.yourOrder}</h1>
    <p className="mt-2 text-sm text-stone-500">{t(lang, "cart.pricesNote")}</p>
    {query.error && !["invalid", "changed"].includes(String(query.error)) && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{lang === "ms" ? "Pesanan belum dihantar. Semak stok dan kuantiti, kemudian cuba lagi." : (errors[String(query.error)] ?? "Order not submitted. Check your details and try again.")}</p>}
    {!ready && <p role="status" className="mt-5 rounded bg-amber-50 p-4">{lang === "ms" ? "Pesanan dibuka tidak lama lagi. Maklumat penghantaran dan pembayaran sedang disediakan." : "Ordering opens soon. Delivery and payment information is being prepared."}</p>}
    {query.updated && <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-900">{c.quantitySaved}</p>}
    {query.error === "invalid" && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{c.invalid}</p>}
    {(priced.invalidItems > 0 || query.error === "changed") && <div role="alert" className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><p>{c.cartChanged}</p><form action={clearCart}><button className="mt-2 underline">{t(lang, "cart.clear")}</button></form></div>}
    {priced.lines.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-stone-300 p-6 sm:p-12 text-center"><p className="text-lg">{t(lang, "cart.empty")}</p><Link href="/catalog" className="shop-button mt-5">{c.allStyles} &rarr;</Link></div> : <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">{priced.lines.map(line => <article key={line.index} className="rounded-xl border border-stone-200 bg-white p-5"><div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4"><div><Link href={"/catalog/" + line.productId} className="text-lg font-semibold hover:underline">{line.productName}</Link><p className="mt-1 text-sm text-stone-500">{line.description}</p></div><strong className="whitespace-nowrap text-lg">{money(line.lineTotal)}</strong></div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-stone-100 pt-4"><form action={updateCartQuantity} className="flex flex-wrap items-end gap-3"><input type="hidden" name="index" value={line.index} /><label className="text-xs font-medium" htmlFor={"cart-qty-" + line.index}>{line.packId ? c.packsQty : c.garments}<input id={"cart-qty-" + line.index} type="number" name="qty" min="1" max="10000" step="1" required defaultValue={cart[line.index].qty} key={cart[line.index].qty} className="shop-input mt-1 block w-20" /></label><button className="min-h-11 px-2 text-sm font-medium underline underline-offset-4">{c.update}</button></form><div className="text-right"><p className="text-xs text-stone-500">{line.units} {c.garments} &middot; {money(line.unitPrice)} {c.perUnit}</p><form action={removeFromCart}><input type="hidden" name="index" value={line.index} /><button className="mt-1 min-h-9 text-xs text-stone-500 underline" aria-label={t(lang, "cart.remove") + ": " + line.productName}>{t(lang, "cart.remove")}</button></form></div></div>
      </article>)}</div>
      <aside className="rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-28"><h2 className="text-xl font-semibold">{c.summary}</h2><div className="mt-5 flex justify-between border-b border-stone-200 pb-5"><span className="text-sm">{t(lang, "cart.subtotal")}</span><strong className="text-2xl">{money(priced.subtotal)}</strong></div>
        {priced.moqIssues.length > 0 && <div role="status" className="mt-4 space-y-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{priced.moqIssues.map(issue => <p key={issue.productName}><strong>{issue.productName}</strong>: {issue.moq - issue.units} {c.more.toLowerCase()}.</p>)}</div>}
        {priced.stockIssues.length > 0 && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{priced.stockIssues.map(issue => <p key={issue.label}>{issue.label}: {issue.available} {lang === "ms" ? "tersedia" : "available"}, {issue.quantity} {lang === "ms" ? "diminta" : "requested"}.</p>)}</div>}
        {ready && <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt>{lang === "ms" ? "Penghantaran" : "Delivery"}</dt><dd>{money(totals.shippingFee)}</dd></div><div className="flex justify-between"><dt>{lang === "ms" ? "Cukai" : "Tax"} ({settings.taxBasisPoints / 100}%)</dt><dd>{money(totals.taxAmount)}</dd></div><div className="flex justify-between font-bold"><dt>{lang === "ms" ? "Jumlah" : "Total"}</dt><dd>{money(totals.total)}</dd></div></dl>}
        <form action={placeOrder} className="mt-5"><input type="hidden" name="checkoutKey" value={randomUUID()} />
        <fieldset className="mb-5 space-y-3"><legend className="mb-3 font-semibold">{lang === "ms" ? "Alamat penghantaran" : "Delivery address"}</legend>
        {([['deliveryName', lang === 'ms' ? 'Nama penerima' : 'Recipient name', user.contactName, 'name'], ['deliveryPhone', lang === 'ms' ? 'Telefon' : 'Phone', user.phone ?? '', 'tel'], ['deliveryAddress', lang === 'ms' ? 'Alamat' : 'Street address', user.address ?? '', 'street-address'], ['deliveryCity', lang === 'ms' ? 'Bandar' : 'City / region', '', 'address-level2'], ['deliveryPostalCode', lang === 'ms' ? 'Poskod' : 'Postal code', '', 'postal-code']] as const).map(([name, label, value, autoComplete]) => <label key={name} className="block text-sm">{label}<input name={name} required maxLength={500} defaultValue={value} autoComplete={autoComplete} className="shop-input mt-1 block w-full" /></label>)}
        <label className="block text-sm">{lang === 'ms' ? 'Negara' : 'Country'}<select name="deliveryCountry" required className="shop-input mt-1 block w-full"><option value="">{lang === 'ms' ? 'Pilih negara' : 'Choose a country'}</option>{settings.shippingCountries.map(country => <option key={country}>{country}</option>)}</select></label>
        </fieldset><label className="block text-sm">{t(lang, "cart.notes")}<textarea name="notes" rows={3} placeholder={t(lang, "cart.notesPlaceholder")} className="shop-input mt-2 w-full" /></label><SubmitButton pendingText={lang === "ms" ? "Menghantar pesanan?" : "Placing order?"} disabled={!ready || priced.moqIssues.length > 0 || priced.invalidItems > 0 || priced.stockIssues.length > 0}>{t(lang, "cart.placeOrder")} &rarr;</SubmitButton><p className="mt-3 text-xs leading-relaxed text-stone-500">{t(lang, "cart.invoiceNote")}</p></form>
        <form action={clearCart}><button className="mt-5 min-h-10 text-xs text-stone-500 underline underline-offset-4">{t(lang, "cart.clear")}</button></form>
      </aside>
    </div>}
  </div>;
}
