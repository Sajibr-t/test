"use client";

import { useRef } from "react";

export default function HomeMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return <details ref={ref} className="home-mobile-nav" onClick={event => {
    if ((event.target as HTMLElement).closest("a") && ref.current) ref.current.open = false;
  }} onKeyDown={event => {
    if (event.key === "Escape" && ref.current) {
      ref.current.open = false;
      ref.current.querySelector("summary")?.focus();
    }
  }}>
    <summary aria-label={label}><span aria-hidden="true">☰</span></summary>
    {children}
  </details>;
}
