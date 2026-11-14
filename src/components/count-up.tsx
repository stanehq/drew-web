"use client";

import { useEffect, useRef, useState } from "react";
import { formatExact } from "@/lib/format";

/**
 * Shows `value`. If the number starts below the fold it counts up from 0 the
 * first time it scrolls into view; if it is already visible it just shows the
 * real number, so it can never sit at 0.
 */
export function CountUp({ value, ms = 1600 }: { value: number; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const r = el?.getBoundingClientRect();
    const visible = !r || (r.top < window.innerHeight && r.bottom > 0);
    if (!el || played.current || visible || typeof IntersectionObserver === "undefined") {
      setShown(value);
      return;
    }
    let raf = 0;
    setShown(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      played.current = true;
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
