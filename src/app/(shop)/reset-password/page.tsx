import { resetPassword } from "@/app/actions/account";
import { getLang } from "@/lib/i18n-server";
export const metadata = { title: "Reset password", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const q = await searchParams; const ms = await getLang() === "ms";
  return <div className="mx-auto max-w-sm"><h1 className="text-3xl">{ms ? "Tetapkan kata laluan" : "Set a new password"}</h1><form action={resetPassword} className="mt-6 space-y-4"><input type="hidden" name="token" value={q.token ?? ''} /><label className="block">{ms ? "Kata laluan (10–72 aksara)" : "Password (10–72 characters)"}<input name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required className="shop-input mt-1 block w-full" /></label><button className="shop-button">{ms ? "Simpan kata laluan" : "Save password"}</button></form></div>;
}
