import { requireUser } from "@/lib/session";
import { updateProfile, changePassword, requestVerification } from "@/app/actions/account";
import { getLang } from "@/lib/i18n-server";

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const q = await searchParams;
  const ms = await getLang() === "ms";
  return <div className="mx-auto max-w-xl space-y-6"><h1 className="text-3xl">{ms ? "Akaun anda" : "Your account"}</h1>
    {q.error && <p role="alert" className="rounded bg-red-50 p-3">{ms ? "Semak maklumat anda dan cuba lagi. Jika terlalu banyak percubaan, tunggu 15 minit." : "Check your details and try again. If you made too many attempts, wait 15 minutes."}</p>}
    {(q.saved || q.verified) && <p role="status" className="rounded bg-green-50 p-3">{ms ? "Disimpan." : "Saved."}</p>}
    {q.verification && <p role="status">{ms ? "Pautan pengesahan telah diminta. Semak e-mel anda." : "Verification requested. Check your email once the message arrives."}</p>}
    <section className="rounded-xl bg-white p-5"><p>{user.email}</p><p className="mt-1 text-sm">{user.emailVerifiedAt ? (ms ? "E-mel disahkan" : "Email verified") : (ms ? "E-mel belum disahkan" : "Email not yet verified")}</p>{!user.emailVerifiedAt && <form action={requestVerification}><button className="mt-3 underline">{ms ? "Hantar pautan pengesahan" : "Send verification link"}</button></form>}</section>
    <form action={updateProfile} className="space-y-4 rounded-xl bg-white p-5"><h2 className="text-xl">{ms ? "Maklumat perniagaan" : "Business details"}</h2>
      {([['businessName', ms ? 'Nama perniagaan' : 'Business name'], ['contactName', ms ? 'Nama kenalan' : 'Contact name'], ['phone', ms ? 'Telefon' : 'Phone'], ['address', ms ? 'Alamat pengebilan' : 'Billing address'], ['taxId', ms ? 'ID cukai' : 'Tax ID']] as const).map(([name, label]) => <label key={name} className="block text-sm">{label}<input name={name} defaultValue={user[name] ?? ''} required={name === 'businessName' || name === 'contactName'} maxLength={name === 'address' ? 1000 : 160} className="shop-input mt-1 block w-full" /></label>)}
      <button className="shop-button">{ms ? "Simpan" : "Save details"}</button></form>
    <form action={changePassword} className="space-y-4 rounded-xl bg-white p-5"><h2 className="text-xl">{ms ? "Tukar kata laluan" : "Change password"}</h2><label className="block text-sm">{ms ? "Kata laluan semasa" : "Current password"}<input type="password" name="currentPassword" autoComplete="current-password" required className="shop-input mt-1 block w-full" /></label><label className="block text-sm">{ms ? "Kata laluan baharu (10–72 aksara)" : "New password (10–72 characters)"}<input type="password" name="password" autoComplete="new-password" minLength={10} maxLength={72} required className="shop-input mt-1 block w-full" /></label><p className="text-xs">{ms ? "Anda akan dilog keluar daripada semua peranti." : "You will be signed out on every device."}</p><button className="shop-button">{ms ? "Tukar kata laluan" : "Change password"}</button></form>
  </div>;
}
