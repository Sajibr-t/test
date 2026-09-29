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

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {status}
    </span>
  );
}
