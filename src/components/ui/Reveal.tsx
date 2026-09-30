/**
 * Scroll-triggered 3D reveal wrapper.
 *
 * Wrap any block and it starts pushed back in Z, tilted slightly, and
 * transparent — then settles flat as it scrolls into view. The actual motion
 * lives in CSS (see `.reveal-*` in globals.css); this component only decides
 * *when* to add the `is-shown` class.
 *
 * Uses IntersectionObserver rather than a scroll listener so the browser does
 * the work off the main thread, and disconnects after firing so each element
 * animates once instead of flickering on every pass.
 *
 * Honours prefers-reduced-motion: visitors who ask for less motion get the
 * final state immediately, with no transition at all.
 *
 *   <Reveal variant="tilt" delay={120}>...</Reveal>
 */
"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "rise" | "tilt" | "zoom" | "left" | "right";

export function Reveal({
  children,
  variant = "rise",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion is handled entirely in CSS — the `.reveal` rules are
    // neutralised under the prefers-reduced-motion media query, so the content
    // is already visible and there is nothing to watch for.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect(); // animate once, then stop watching
        }
      },
      // Fire slightly before the element is fully on screen so the motion
      // finishes about when the reader's eye arrives.
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant} ${shown ? "is-shown" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Staggered reveal for grids — each child comes in a beat after the one before,
 * which reads as one wave rather than everything popping at once.
 */
export function RevealStagger({
  children,
  variant = "rise",
  step = 70,
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  step?: number;
  className?: string;
}) {
  return (
    <>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <Reveal
              key={i}
              variant={variant}
              delay={i * step}
              className={className}
            >
              {child}
            </Reveal>
          ))
        : children}
    </>
  );
}
