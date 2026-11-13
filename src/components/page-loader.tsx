"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader } from "@/components/loader";

// The first load always shows the loader at least this long.
const FIRST_MS = 4000;
// Page changes inside the site show it at least this long.
const NAV_MS = 700;
const MAX_MS = 8000;

/**
 * Full-screen loader over the whole site: on the first load until the page,
 * fonts and images are ready (at least 4 s), and again on every page change.
 * Rendered on the server so it covers the page from the first paint. A CSS
 * fallback hides it if JavaScript fails.
 */
export function PageLoader() {
  const pathname = usePathname();
  const [state, setState] = useState<"show" | "fade" | "gone">("show");
  const shownAt = useRef(0);
  const first = useRef(true);
  const [nav, setNav] = useState(false);

  const hide = (min: number) => {
    const wait = Math.max(0, min - (performance.now() - shownAt.current));
    window.setTimeout(() => {
      setState("fade");
      window.setTimeout(() => setState((s) => (s === "fade" ? "gone" : s)), 900);
    }, wait);
  };

  // First load: wait for everything, never less than FIRST_MS.
  useEffect(() => {
    shownAt.current = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      first.current = false;
      hide(FIRST_MS);
    };
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }));
    Promise.all([loaded, document.fonts?.ready]).then(finish, finish);
    const cap = window.setTimeout(finish, MAX_MS);
    return () => window.clearTimeout(cap);
  }, []);

  // Show it as soon as an internal link is clicked.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === location.pathname) return; // same page or a #section
      shownAt.current = performance.now();
      setNav(true);
      setState("show");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The new page is in place: let it go after the minimum.
  useEffect(() => {
    if (first.current) return;
    hide(NAV_MS);
  }, [pathname]);

  if (state === "gone") return null;
  return (
    <div
      className={`page-loader fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-black ${state === "fade" ? "page-loader-leave pointer-events-none" : ""} ${nav ? "page-loader-nav" : ""}`}
      aria-hidden={state === "fade"}
    >
      <div className="page-loader-mark">
        <Loader size={150} />
      </div>
    </div>
  );
}
