"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Enhance server-rendered content; all content stays visible without JavaScript. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-home-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.homeReveal = "visible";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );

    const revealAll = () => {
      if (!preference.matches) return;
      observer.disconnect();
      elements.forEach((element) => {
        element.dataset.homeReveal = "visible";
      });
    };

    if (!preference.matches) {
      // Batch layout reads before writes; never hide already visible content.
      const belowFold = elements.filter(
        (element) => element.getBoundingClientRect().top > window.innerHeight,
      );
      belowFold.forEach((element) => {
        element.dataset.homeReveal = "pending";
        observer.observe(element);
      });
    }
    preference.addEventListener("change", revealAll);

    return () => {
      observer.disconnect();
      preference.removeEventListener("change", revealAll);
      elements.forEach((element) => {
        element.dataset.homeReveal = "visible";
      });
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
