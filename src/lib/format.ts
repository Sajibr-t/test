/**
 * Display formatting for money and dates.
 *
 * Money is handled as integer cents everywhere in the app (see lib/pricing.ts).
 * These helpers are the only place cents get turned into text, so changing the
 * currency below changes it across the whole storefront, invoices included.
 */

// Change these two lines to switch the store's currency.
const CURRENCY = "USD";
const LOCALE = "en-US";

/** 650 -> "$6.50" */
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
 * Parse an admin price input into cents: "8.50" or "$8.50" -> 850.
 *
 * Strips currency symbols and stray characters first, so admins can type
 * naturally. Returns null for anything that isn't a valid non-negative number,
 * which callers treat as a validation failure rather than silently saving 0.
 */
export function parseMoney(input: string): number | null {
  const n = Number(String(input).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
