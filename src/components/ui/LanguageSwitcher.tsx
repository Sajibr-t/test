/**
 * EN / BM toggle.
 *
 * A client component purely so it can read the current URL — switching
 * language should leave you exactly where you were, filters and all, rather
 * than dropping you back on the catalogue. The switch itself is still a plain
 * form posting to a server action, so it works without JavaScript; without JS
 * the fallback path is used instead of the live one.
 *
 * The active language renders as a label, not a button, since pressing it
 * would do nothing.
 */
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { setLanguage } from "@/app/actions/lang";
import { LANGS, type Lang } from "@/lib/i18n";

export function LanguageSwitcher({
  lang,
  fallback = "/catalog",
}: {
  lang: Lang;
  /** Used when the live path isn't available (e.g. before hydration). */
  fallback?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams().toString();
  const here = (pathname ?? fallback) + (params ? `?${params}` : "");

  return (
    <div className="flex items-center rounded-full border border-stone-200 p-0.5">
      {LANGS.map((l) =>
        l.code === lang ? (
          <span
            key={l.code}
            aria-current="true"
            title={l.long}
            className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white"
          >
            {l.label}
          </span>
        ) : (
          <form key={l.code} action={setLanguage}>
            <input type="hidden" name="lang" value={l.code} />
            <input type="hidden" name="returnTo" value={here} />
            <button
              type="submit"
              title={`Switch to ${l.long}`}
              className="rounded-full px-2.5 py-1 text-[11px] font-bold text-stone-500 transition hover:text-ink"
            >
              {l.label}
            </button>
          </form>
        )
      )}
    </div>
  );
}
