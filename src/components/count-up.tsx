"use client";

import { useEffect, useRef, useState } from "react";
import { formatExact } from "@/lib/format";

/** Counts up to `value` once it scrolls into view. */
export function CountUp({ value, ms = 1600 }: { value: number; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / ms);
        setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, ms]);

  return (
    <span ref={ref} className="tabular-nums" aria-label={formatExact(value)}>
      {formatExact(shown)}
    </span>
  );
}
