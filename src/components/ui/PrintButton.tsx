/**
 * "Print / save as PDF" button on the invoice page.
 *
 * Exists purely because window.print() needs the browser, so this one button
 * is a client component while the invoice around it stays server-rendered.
 * The invoice's print layout is handled by print: Tailwind classes.
 */
"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded border border-stone-300 px-4 py-2 text-sm hover:bg-cream-dark print:hidden"
    >
      Print / save as PDF
    </button>
  );
}
