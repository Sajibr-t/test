import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getStoreSettings } from "@/lib/store-settings";
import { saveSettings } from "@/app/actions/settings";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const [s, query] = await Promise.all([getStoreSettings(), searchParams]);
  return <div className="mx-auto max-w-3xl"><Link href="/admin" className="underline">Admin dashboard</Link><h1 className="mt-3 text-3xl">Store settings</h1>
    <p className="mt-3 text-sm text-stone-600">Prices use MYR. Confirm your delivery charges, tax treatment and business information before accepting orders.</p>
    {query.saved && <p role="status" className="mt-4 text-green-800">Settings saved.</p>}
    {query.error && <p role="alert" className="mt-4 text-red-800">Check the fields. Enabling checkout requires business name/address, support email, payment instructions and at least one delivery country.</p>}
    <form action={saveSettings} className="mt-6 space-y-5 rounded-xl bg-white p-6">
      {([['businessName', 'Business name'], ['supportEmail', 'Support email'], ['supportPhone', 'Support phone']] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}<input name={key} type={key === 'supportEmail' ? 'email' : 'text'} defaultValue={s[key]} className="shop-input mt-1 block w-full" /></label>)}
      <label className="block text-sm">Business address<textarea name="businessAddress" defaultValue={s.businessAddress} className="shop-input mt-1 block w-full" /></label>
      <label className="block text-sm">Delivery countries (comma separated)<input name="shippingCountries" defaultValue={s.shippingCountries.join(', ')} className="shop-input mt-1 block w-full" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Flat delivery fee (MYR)<input name="shippingFee" type="number" min="0" step="0.01" required defaultValue={(s.shippingFee / 100).toFixed(2)} className="shop-input mt-1 block w-full" /></label><label className="block text-sm">Tax percentage<input name="taxPercent" type="number" min="0" max="100" step="0.01" required defaultValue={s.taxBasisPoints / 100} className="shop-input mt-1 block w-full" /></label></div>
      <p className="text-xs text-stone-600">Tax applies to merchandise plus delivery. This version supports one delivery rate for the listed countries. Enter 0 only if you intend no charge.</p>
      {([['paymentInstructions', 'Payment instructions (bank details/reference)'], ['deliveryPolicy', 'Delivery information'], ['returnsPolicy', 'Returns policy'], ['privacyPolicy', 'Privacy policy'], ['terms', 'Terms of trade']] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}<textarea name={key} rows={5} defaultValue={s[key]} className="shop-input mt-1 block w-full" /></label>)}
      <label className="flex items-center gap-3"><input type="checkbox" name="checkoutEnabled" defaultChecked={s.checkoutEnabled} />Enable checkout with these settings</label>
      <button className="shop-button">Save settings</button>
    </form></div>;
}
