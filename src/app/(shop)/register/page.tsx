import { register } from "@/app/actions/auth";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const params = await searchParams;
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-bold text-brand">
        {t(lang, "auth.registerTitle")}
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        {t(lang, "auth.registerIntro")}
      </p>
      {params.error === "rate" && <p role="alert" className="mt-3 text-red-800">{lang === "ms" ? "Terlalu banyak permohonan. Cuba lagi kemudian." : "Too many applications. Please try again later."}</p>}
      {params.error === "exists" && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {t(lang, "auth.emailTaken")}
        </p>
      )}
      {params.error === "invalid" && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {t(lang, "auth.fillRequired")}
        </p>
      )}
      <form action={register} className="mt-6 space-y-4">
        <label className="block text-sm">
          {t(lang, "auth.businessName")} *
          <input
            name="businessName"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t(lang, "auth.contactName")} *
          <input
            name="contactName"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t(lang, "auth.email")} *
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t(lang, "auth.password")} *{" "}
          <span className="text-stone-400">{t(lang, "auth.minChars")}</span>
          <input
            name="password"
            type="password"
            minLength={10} maxLength={72}
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t(lang, "auth.phone")}
          <input
            name="phone"
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t(lang, "auth.address")}
          <textarea
            name="address"
            rows={2}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t(lang, "auth.taxId")}
          <input
            name="taxId"
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-brand py-2 font-medium text-white hover:bg-brand-light"
        >
          {t(lang, "auth.submitApplication")}
        </button>
      </form>
    </div>
  );
}
