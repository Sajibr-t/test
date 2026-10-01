import { verifyEmail } from "@/app/actions/account";
import { getLang } from "@/lib/i18n-server";
export const metadata = { title: "Verify email", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const q = await searchParams; const ms = await getLang() === "ms";
  return <div className="mx-auto max-w-sm"><h1 className="text-3xl">{ms ? "Sahkan e-mel" : "Verify email"}</h1>{q.error ? <p className="mt-5">{ms ? "Pautan tidak sah atau tamat tempoh. Minta pautan baharu dalam akaun anda." : "This link is invalid or expired. Request a new one from your account."}</p> : <form action={verifyEmail} className="mt-6"><input type="hidden" name="token" value={q.token ?? ''} /><button className="shop-button">{ms ? "Sahkan alamat e-mel saya" : "Verify my email address"}</button></form>}</div>;
}
