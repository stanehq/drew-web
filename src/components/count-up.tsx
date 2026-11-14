"use client";

import { useEffect, useRef, useState } from "react";
import { formatExact } from "@/lib/format";

/**
 * Counts up from 0 to `value` when the number is on screen (after the loader). If it is already
 * visible it starts right away instead of waiting for the observer, and a new
 * `value` counts on from the number already shown, so it never stays at 0.
 */
export function CountUp({ value, ms = 1600 }: { value: number; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const from = current.current;
    let wait = 0;
    const run = () => {
      if (started) return;
      // Wait until the full-screen loader is gone so the count is actually seen.
      if (document.querySelector(".page-loader")) {
        wait = window.setTimeout(run, 120);
        return;
      }
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / ms);
        const next = Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3)));
        current.current = next;
        setShown(next);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const r = el.getBoundingClientRect();
    if (typeof IntersectionObserver === "undefined" || (r.top < window.innerHeight && r.bottom > 0)) {
      run();
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(wait);
      };
    }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      run();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(wait);
    };
  }, [value, ms]);

  return (
    <span ref={ref} className="tabular-nums" aria-label={formatExact(value)}>
      {formatExact(shown)}
    </span>
  );
}
