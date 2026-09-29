// Change these two lines to switch the store's currency.
const CURRENCY = "USD";
const LOCALE = "en-US";

export function money(cents: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(cents / 100);
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(d);
}

// "8.50" -> 850 cents; returns null on bad input
export function parseMoney(input: string): number | null {
  const n = Number(String(input).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
