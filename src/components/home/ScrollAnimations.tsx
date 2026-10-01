"use client";

import { useEffect } from "react";

/** Progressive enhancement: content remains visible if scripts or motion are disabled. */
export default function ScrollAnimations() {
  useEffect(() => {
    const root = document.getElementById("home-main");
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const hero = root.querySelector<HTMLElement>(".home-hero");
    const art = root.querySelector<HTMLElement>(".home-hero-art");
    const groups = Array.from(root.querySelectorAll<HTMLElement>(".home-categories, .home-featured-grid, .home-steps"));
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    let frame = 0;

    const render = () => {
      frame = 0;
      if (preference.matches) return;
      const height = window.innerHeight;
      const strength = mobile.matches ? 0.35 : 1;
      // Measure stationary parents before writing transforms to their children.
      const heroRect = hero?.getBoundingClientRect();
      const measurements = groups.map(group => ({ group, rect: group.getBoundingClientRect() }));
      if (heroRect && art && heroRect.bottom > 0 && heroRect.top < height) {
        const progress = clamp(-heroRect.top / heroRect.height) * strength;
        art.style.setProperty("--scene-tilt", `${progress * 13}deg`);
        art.style.setProperty("--scene-turn", `${progress * -16}deg`);
        art.style.setProperty("--scene-rise", `${progress * -50}px`);
        art.style.setProperty("--near-rise", `${progress * -65}px`);
        art.style.setProperty("--far-rise", `${progress * 28}px`);
      }
      for (const { group, rect } of measurements) {
        if (rect.bottom < -150 || rect.top > height + 150) continue;
        const progress = clamp((rect.top + rect.height / 2 - height / 2) / (height * 0.65));
        Array.from(group.children).forEach((child, index) => {
          const card = child as HTMLElement;
          const direction = index % 2 === 0 ? -1 : 1;
          card.style.setProperty("--card-tilt", `${progress * 14 * strength}deg`);
          card.style.setProperty("--card-turn", `${progress * direction * 9 * strength}deg`);
          card.style.setProperty("--card-rise", `${Math.abs(progress) * (22 + index % 3 * 10) * strength}px`);
        });
      }
    };
    const schedule = () => {
      if (!frame && !preference.matches) frame = window.requestAnimationFrame(render);
    };
    const updatePreference = () => {
      root.classList.toggle("home-depth-active", !preference.matches);
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (!preference.matches) schedule();
    };
    updatePreference();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", updatePreference);
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", updatePreference);
      resize.disconnect();
      root.classList.remove("home-depth-active");
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById("home-main");
    if (!root || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<Element, Animation>();
    const targets = root.querySelectorAll<HTMLElement>(
      ".home-section-heading, .home-category, .home-featured-card, " +
      ".home-centered-heading, .home-steps article, .home-pricing, " +
      ".home-faq > div, .home-apply"
    );
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches || entry.target.contains(document.activeElement)) continue;

        const element = entry.target as HTMLElement;
        const siblings = element.parentElement?.children;
        const index = siblings ? Array.from(siblings).indexOf(element) : 0;
        const stagger = element.matches(".home-category, .home-featured-card, .home-steps article");
        const animation = element.animate(
          [{ opacity: 0.15, translate: "0 22px" }, { opacity: 1, translate: "0 0" }],
          { duration: 650, delay: stagger ? (index % 4) * 70 : 0, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        );
        animations.set(element, animation);
        animation.onfinish = () => animations.delete(element);
      }
    }, { threshold: 0.08 });

    // Leave the initial viewport and restored scroll position immediately readable.
    targets.forEach(element => {
      if (element.getBoundingClientRect().top >= window.innerHeight) observer.observe(element);
    });

    const stopMotion = () => {
      if (!preference.matches) return;
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      const focused = event.target;
      targets.forEach(element => {
        if (!element.contains(focused)) return;
        observer.unobserve(element);
        animations.get(element)?.cancel();
        animations.delete(element);
      });
    };
    preference.addEventListener("change", stopMotion);
    root.addEventListener("focusin", revealFocused);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener("change", stopMotion);
      root.removeEventListener("focusin", revealFocused);
    };
  }, []);

  return null;
}
