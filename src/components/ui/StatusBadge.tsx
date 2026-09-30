/**
 * Coloured pill for order, invoice and buyer statuses.
 *
 * One component for all three so a status always looks the same wherever it
 * appears. Colours carry meaning: amber = waiting on someone, blue = in
 * progress, green = done, red = rejected, grey = cancelled or unknown.
 * An unrecognised status still renders, in neutral grey.
 */
import { t, type Key, type Lang } from "@/lib/i18n";

const styles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-stone-100 text-stone-500",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  UNPAID: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
};

export function StatusBadge({
  status,
  lang = "en",
}: {
  status: string;
  lang?: Lang;
}) {
  // An unknown status has no dictionary entry; show the raw value rather than
  // a blank pill.
  const key = `status.${status}` as Key;
  const label = status in styles ? t(lang, key) : status;
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {label}
    </span>
  );
}
