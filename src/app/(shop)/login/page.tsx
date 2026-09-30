import Link from "next/link";
import { login } from "@/app/actions/auth";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-2xl font-bold text-brand">
        {t(lang, "auth.login")}
      </h1>
      {params.error && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {t(lang, "auth.invalid")}
        </p>
      )}
      <form action={login} className="mt-6 space-y-4">
        <label className="block text-sm">
          {t(lang, "auth.email")}
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t(lang, "auth.password")}
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-brand py-2 font-medium text-white hover:bg-brand-light"
        >
          {t(lang, "auth.login")}
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-500">
        {t(lang, "auth.noAccount")}{" "}
        <Link href="/register" className="underline">
          {t(lang, "auth.applyLink")}
        </Link>
      </p>
    </div>
  );
}
