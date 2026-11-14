"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Box = { left: number; top: number; width: number; height: number };

/**
 * The legal tabs' sliding highlight, for any list: it sits under the active
 * item, follows the pointer or keyboard focus, and slides back on leave.
 *
 * Put `containerProps` on a `position: relative` element, `itemProps(key)` on
 * each item, and call `highlight()` inside the container (a plain function, not
 * a component, so React keeps the same element and the CSS transition runs).
 */
/** `watch`: anything that re-renders the items (e.g. a dropdown opening), to re-measure. */
export function useSlidingHighlight<K extends string>(active: K, watch?: unknown) {
  const items = useRef<Partial<Record<K, HTMLElement | null>>>({});
  const [box, setBox] = useState<Box | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback((key: K): Box | null => {
    const el = items.current[key];
    return el ? { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight } : null;
  }, []);

  const moveTo = useCallback((key: K) => {
    const b = measure(key);
    if (b) setBox(b);
  }, [measure]);

  // Follow the active item; animate only after the first placement.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      moveTo(active);
      requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [active, moveTo, watch]);

  const itemProps = (key: K) => ({
    ref: (el: HTMLElement | null) => {
      items.current[key] = el;
    },
    onMouseEnter: () => moveTo(key),
    onFocus: () => moveTo(key),
  });

  const containerProps = { onMouseLeave: () => moveTo(active) };

  const highlight = (className = "bg-white/15") =>
    box ? (
      <span
        aria-hidden
        className={`pointer-events-none absolute rounded-[inherit] ${ready ? "transition-[left,top,width,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""} ${className}`}
        style={{ left: box.left, top: box.top, width: box.width, height: box.height, borderRadius: "0.75rem" }}
      />
    ) : null;

  return { itemProps, containerProps, highlight };
}
