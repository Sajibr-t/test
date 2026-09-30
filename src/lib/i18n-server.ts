/**
 * Server-only half of the language support.
 *
 * Kept separate from `@/lib/i18n` because reading the cookie needs
 * `next/headers`, which a Client Component may not import. The language
 * switcher is a Client Component and imports the dictionary from `i18n`, so
 * that file has to stay free of server-only APIs.
 */
import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "./i18n";

/** The visitor's chosen language. Defaults to English. */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "ms" ? "ms" : "en";
}
