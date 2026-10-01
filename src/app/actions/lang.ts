/**
 * Language switching.
 *
 * Stores the choice in a cookie and sends the visitor back to the page they
 * were on, so switching language never loses their place or their filters.
 */
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LANG_COOKIE } from "@/lib/i18n";

export async function setLanguage(formData: FormData) {
  const lang = String(formData.get("lang") ?? "en") === "ms" ? "ms" : "en";

  const store = await cookies();
  store.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // remember for a year
    sameSite: "lax",
  });

  // Return to the page the switcher was used on. Same-site paths only —
  // an unchecked value here would be an open redirect.
  const raw = String(formData.get("returnTo") ?? "");
  const back = raw.startsWith("/") && !raw.startsWith("//") && !/[\\\x00-\x20]/.test(raw) ? raw : "/";
  redirect(back);
}
