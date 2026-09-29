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
