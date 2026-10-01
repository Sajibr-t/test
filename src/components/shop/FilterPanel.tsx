"use client";

import { useEffect, useRef } from "react";

/** Native disclosure on phones; always expanded on larger screens. */
export default function FilterPanel({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const sync = () => { if (ref.current) ref.current.open = desktop.matches; };
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  return <details ref={ref} open className="shop-filters">
    <summary className="flex cursor-pointer items-center justify-between font-semibold" onClick={event => {
      if (window.matchMedia("(min-width: 1024px)").matches) event.preventDefault();
    }}>{title}<span className="lg:hidden" aria-hidden="true">+</span></summary>
    {children}
  </details>;
}
