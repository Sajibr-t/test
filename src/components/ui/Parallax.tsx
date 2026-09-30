/**
 * Parallax layer — drifts at a different rate to the page as you scroll,
 * which reads as depth.
 *
 * `speed` is how far it moves relative to normal scrolling:
 *   negative (e.g. -0.15) => drifts UP, appears further back
 *   positive (e.g.  0.12) => drifts DOWN, appears closer to the viewer
 *
 * Position is read once per animation frame and only while the element is on
 * screen, so scrolling stays smooth. Skipped entirely for visitors who prefer
 * reduced motion.
 */
"use client";

import { useEffect, useRef } from "react";

export function Parallax({
  children,
  speed = -0.12,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let onScreen = true;

    // Only run the maths while the layer is actually visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(el);

    const update = () => {
      frame = 0;
      if (!onScreen) return;
      const rect = el.getBoundingClientRect();
      // How far this element is from the middle of the screen.
      const fromCentre = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(fromCentre * speed).toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      // Coalesce bursts of scroll events into one write per frame.
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`parallax ${className}`}>
      {children}
    </div>
  );
}
