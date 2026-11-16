"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type State = "idle" | "hidden" | "in";

/**
 * Fades and lifts its content in the first time it scrolls into view. Content that is already on screen when the page
 * loads, or above the viewport, is left alone, and without JavaScript everything stays visible.
 */
export function Reveal({
  children,
  as,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState((prev) => (prev === "hidden" ? "in" : prev));
          io.disconnect();
        } else if (entry.boundingClientRect.top < 0) {
          // Already scrolled past (for example after a reload halfway down the page).
          io.disconnect();
        } else {
          setState((prev) => (prev === "idle" ? "hidden" : prev));
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const motion = state === "hidden" ? "reveal-hidden" : state === "in" ? "reveal-in" : "";
  return (
    <Tag ref={ref} className={`${className} ${motion}`.trim()} style={delay ? ({ "--d": `${delay}ms` } as CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}
