"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "@/components/locale-link";

type Tab = { slug: string; title: string };
type Box = { left: number; width: number };

const KEY = "drew-legal-tab";

/**
 * Document tabs with a highlight that slides: it follows the cursor and, when
 * you open another document, glides from the previous tab to the new one.
 */
export function LegalTabs({ tabs, active }: { tabs: Tab[]; active: string }) {
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [box, setBox] = useState<Box | null>(null);
  const [animate, setAnimate] = useState(false);

  const measure = (slug: string): Box | null => {
    const el = refs.current[slug];
    const li = el?.parentElement;
    return el && li ? { left: li.offsetLeft, width: el.offsetWidth } : null;
  };

  // Start where the previous page left off, then slide to the active tab.
  useLayoutEffect(() => {
    let prev: string | null = null;
    try {
      prev = sessionStorage.getItem(KEY);
      sessionStorage.setItem(KEY, active);
    } catch {}
    let second = 0;
    const first = requestAnimationFrame(() => {
      const start = prev && prev !== active ? measure(prev) : null;
      setAnimate(false);
      setBox(start ?? measure(active));
      second = requestAnimationFrame(() => {
        setAnimate(true);
        setBox(measure(active));
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [active]);

  useEffect(() => {
    const onResize = () => setBox(measure(active));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  return (
    <nav aria-label="Legal documents" className="mx-auto mt-10 flex max-w-3xl justify-center overflow-x-auto">
      <ul className="relative flex gap-1 rounded-xl border border-white/10 p-1" onMouseLeave={() => setBox(measure(active))}>
        {box && (
          <span
            aria-hidden
            className={`absolute bottom-1 top-1 rounded-lg bg-white/10 ${animate ? "transition-[left,width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]" : ""}`}
            style={{ left: box.left, width: box.width }}
          />
        )}
        {tabs.map((d) => (
          <li key={d.slug} className="relative">
            <Link
              ref={(el) => {
                refs.current[d.slug] = el;
              }}
              href={`/${d.slug}`}
              aria-current={d.slug === active ? "page" : undefined}
              onMouseEnter={() => setBox(measure(d.slug))}
              onFocus={() => setBox(measure(d.slug))}
              className={`relative block whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-colors ${
                d.slug === active ? "text-fg" : "text-soft hover:text-fg"
              }`}
            >
              {d.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
