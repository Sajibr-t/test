"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

export default function ShopHeroSlider({ children, lang }: { children: ReactNode; lang: string }) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;
  const active = index % Math.max(count, 1);
  const ms = lang === "ms";
  const paused = hovered || focused || stopped || reducedMotion;
  const go = (step: number) => setIndex(current => (current + step + count) % count);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, count, active]);

  if (!count) return null;

  return <section className="shop-offers" aria-roledescription="carousel" aria-label={ms ? "Tawaran koleksi" : "Collection offers"}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => {
      if (count < 2) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); setStopped(true); go(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}
    onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
    onTouchCancel={() => { touch.current = null; }}
    onTouchEnd={event => {
      if (!touch.current || count < 2) return;
      const dx = event.changedTouches[0].clientX - touch.current.x;
      const dy = event.changedTouches[0].clientY - touch.current.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { setStopped(true); go(dx < 0 ? 1 : -1); }
      touch.current = null;
    }}>
    <div className="shop-offers-track" style={{ transform: `translateX(-${active * 100}%)` }}>
      {slides.map((slide, i) => <div className="shop-offers-slide" key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${count}`} aria-hidden={i !== active} inert={i !== active}>{slide}</div>)}
    </div>
    {count > 1 && <div className="shop-offers-controls">
      <button type="button" aria-label={ms ? "Tawaran sebelumnya" : "Previous offer"} onClick={() => { setStopped(true); go(-1); }}>‹</button>
      <span className="shop-offers-count" aria-live={paused ? "polite" : "off"}>{active + 1} / {count}</span>
      <button type="button" aria-label={ms ? "Tawaran seterusnya" : "Next offer"} onClick={() => { setStopped(true); go(1); }}>›</button>
      {!reducedMotion && <button type="button" className="shop-offers-play" aria-label={stopped ? (ms ? "Mainkan tawaran" : "Play offers") : (ms ? "Jeda tawaran" : "Pause offers")} onClick={() => setStopped(value => !value)}>{stopped ? "▶" : "Ⅱ"}</button>}
    </div>}
  </section>;
}
