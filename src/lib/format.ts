/**
 * Display formatting for money and dates.
 *
 * Money is handled as integer cents everywhere in the app (see lib/pricing.ts).
 * These helpers are the only place cents get turned into text, so changing the
 * currency below changes it across the whole storefront, invoices included.
 */

// Change these two lines to switch the store's currency.
// Malaysian Ringgit, formatted for Malaysia (RM 6.50, 30 Sep 2026).
const CURRENCY = "MYR";
const LOCALE = "en-MY";

/** 650 -> "RM 6.50" */
export function money(cents: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(cents / 100);
}

/** Date -> "30 Sep 2026" (style follows LOCALE above). */
export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(d);
}

/**
 * Parse an admin price input into sen: "8.50" or "RM 8.50" -> 850.
 *
 * Accepts an optional RM prefix and up to two decimal places.
 * Returns null for anything that is not a valid non-negative amount,
 * which callers treat as a validation failure rather than silently saving 0.
 */
export function parseMoney(input: string): number | null {
  const raw = String(input).trim().replace(/^RM\s*/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const cents = Math.round(Number(raw) * 100);
  return Number.isSafeInteger(cents) && cents <= 100000000 ? cents : null;
}
