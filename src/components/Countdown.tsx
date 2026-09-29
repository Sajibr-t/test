"use client";

import { useEffect, useState } from "react";

// White square chips: big purple number, small grey label beneath.
export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = now === null ? 0 : Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hrs = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);

  const chips: [string, string][] = [
    [now === null ? "--" : String(days).padStart(2, "0"), "Days"],
    [now === null ? "--" : String(hrs).padStart(2, "0"), "Hrs"],
    [now === null ? "--" : String(mins).padStart(2, "0"), "Mins"],
    [now === null ? "--" : String(secs).padStart(2, "0"), "Secs"],
  ];

  return (
    <div className="flex gap-2">
      {chips.map(([value, label]) => (
        <div
          key={label}
          className="w-14 rounded-xl bg-white py-2 text-center shadow-sm ring-1 ring-stone-100"
        >
          <div className="font-display text-lg font-bold leading-none text-brand">
            {value}
          </div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-stone-400">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
