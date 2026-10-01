import { requestPasswordReset } from "@/app/actions/account";
import { getLang } from "@/lib/i18n-server";
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const q = await searchParams; const ms = await getLang() === "ms";
  return <div className="mx-auto max-w-sm"><h1 className="text-3xl">{ms ? "Lupa kata laluan" : "Forgot password"}</h1>{q.sent ? <p role="status" className="mt-5">{ms ? "Jika akaun wujud, pautan tetapan semula akan dihantar melalui e-mel." : "If an account exists for that email, a reset link will be sent."}</p> : <form action={requestPasswordReset} className="mt-6 space-y-4">{q.error && <p role="alert">{ms ? "Pautan tidak sah atau tamat tempoh. Minta pautan baharu." : "The link is invalid or expired, or the password did not meet the requirements. Request a new link."}</p>}<label className="block">{ms ? "E-mel" : "Email"}<input name="email" type="email" autoComplete="email" maxLength={254} required className="shop-input mt-1 block w-full" /></label><button className="shop-button">{ms ? "Hantar pautan" : "Send reset link"}</button></form>}</div>;
}
