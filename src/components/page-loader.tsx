"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader } from "@/components/loader";
import { splitLocale } from "@/lib/locales";

const FIRST_MS = 3500;
const MAX_MS = 8000;

/** Shows only on an initial homepage load and explicit language changes. */
export function PageLoader() {
  const pathname = usePathname();
  const isHome = splitLocale(pathname)[1] === "/";
  const initialHome = useRef(isHome);
  const shownAt = useRef(0);
  const timers = useRef<number[]>([]);
  const [visible, setVisible] = useState(() => isHome);
  const [fading, setFading] = useState(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const hide = useCallback((minimum: number) => {
    clearTimers();
    const wait = Math.max(0, minimum - (performance.now() - shownAt.current));
    timers.current.push(window.setTimeout(() => {
      setFading(true);
      timers.current.push(window.setTimeout(() => {
        setVisible(false);
        setFading(false);
      }, 450));
    }, wait));
  }, [clearTimers]);

  useEffect(() => {
    if (!initialHome.current) {
      setVisible(false);
      return;
    }

    shownAt.current = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      hide(FIRST_MS);
    };
    const loaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
    Promise.all([loaded, document.fonts?.ready]).then(finish, finish);
    const cap = window.setTimeout(finish, MAX_MS);

    return () => {
      window.clearTimeout(cap);
      clearTimers();
    };
  }, [clearTimers, hide]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!visible) return null;
  return (
    <div
      className={`page-loader fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-black ${fading ? "page-loader-leave pointer-events-none" : ""}`}
      aria-hidden={fading}
    >
      <div className="page-loader-mark">
        <Loader />
      </div>
    </div>
  );
}
