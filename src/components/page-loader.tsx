"use client";

import { useEffect, useState } from "react";
import { Loader } from "@/components/loader";

const MIN_MS = 350;
const MAX_MS = 4000;

/**
 * Full-screen loader shown on the first load until the page, its fonts and
 * images are ready, so nothing pops in. Rendered on the server so it covers
 * the page from the first paint. A CSS fallback hides it if JavaScript fails.
 */
export function PageLoader() {
  const [state, setState] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      setTimeout(() => {
        setState("fade");
        setTimeout(() => setState("gone"), 400);
      }, wait);
    };
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }));
    Promise.all([loaded, document.fonts?.ready]).then(finish, finish);
    const cap = setTimeout(finish, MAX_MS);
    return () => clearTimeout(cap);
  }, []);

  if (state === "gone") return null;
  return (
    <div
      className={`page-loader fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-400 ${state === "fade" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      aria-hidden={state === "fade"}
    >
      <Loader size={64} />
    </div>
  );
}
