"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "@/components/locale-link";

type Tab = { slug: string; title: string };
type Box = { left: number; width: number };

const KEY = "drew-legal-tab";

/** Sliding active-tab indicator that remains visible during document navigation. */
export function LegalTabs({ tabs, active }: { tabs: Tab[]; active: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [box, setBox] = useState<Box | null>(null);
  const [animate, setAnimate] = useState(false);

  const measure = (slug: string): Box | null => {
    const el = refs.current[slug];
    const list = listRef.current;
    if (!el || !list) return null;
    const item = el.parentElement;
    if (!item) return null;
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return { left: itemRect.left - listRect.left, width: el.getBoundingClientRect().width };
  };

  useLayoutEffect(() => {
    let previous: string | null = null;
    try {
      previous = sessionStorage.getItem(KEY);
      sessionStorage.setItem(KEY, active);
    } catch {
      // Storage may be unavailable; the active tab still renders normally.
    }

    const start = previous && previous !== active ? measure(previous) : null;
    setAnimate(false);
    setBox(start ?? measure(active));

    // Start the transition only after the previous position has been painted.
    const frame = requestAnimationFrame(() => {
      setBox(measure(active));
      setAnimate(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  useEffect(() => {
    const update = () => setBox(measure(active));
    const observer = listRef.current ? new ResizeObserver(update) : null;
    if (listRef.current) observer?.observe(listRef.current);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [active]);

  return (
    <nav aria-label="Legal documents" className="mx-auto mt-10 w-full max-w-3xl">
      <div className="overflow-x-auto overscroll-x-contain">
        <ul
          ref={listRef}
          className="relative mx-auto flex w-max min-w-max gap-1 rounded-xl border border-white/10 p-1"
          onMouseLeave={() => setBox(measure(active))}
        >
          {box && (
            <span
              aria-hidden
              className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white/10 will-change-[left,width] ${animate ? "transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""}`}
              style={{ left: box.left, width: box.width }}
            />
          )}
          {tabs.map((tab) => (
            <li key={tab.slug} className="relative">
              <Link
                ref={(el) => {
                  refs.current[tab.slug] = el;
                }}
                href={`/${tab.slug}`}
                aria-current={tab.slug === active ? "page" : undefined}
                onMouseEnter={() => setBox(measure(tab.slug))}
                onFocus={() => setBox(measure(tab.slug))}
                className={`relative block whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  tab.slug === active ? "text-fg" : "text-soft hover:text-fg"
                }`}
              >
                {tab.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
