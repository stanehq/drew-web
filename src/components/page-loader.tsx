"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader } from "@/components/loader";

const FIRST_MS = 4500;
const NAV_MS = 700;
const MAX_MS = 8000;

/** Shows on the English home page's first load and when the visitor changes language. */
export function PageLoader() {
  const pathname = usePathname();
  const [state, setState] = useState<"show" | "fade" | "gone">("show");
  const [visible, setVisible] = useState(() => pathname === "/");
  const [nav, setNav] = useState(false);
  const shownAt = useRef(0);
  const initialPath = useRef(pathname);
  const localeChange = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  const hide = (minimum: number) => {
    clearTimers();
    const wait = Math.max(0, minimum - (performance.now() - shownAt.current));
    timers.current.push(window.setTimeout(() => {
      setState("fade");
      timers.current.push(window.setTimeout(() => {
        setState("gone");
        setVisible(false);
      }, 900));
    }, wait));
  };

  useEffect(() => {
    if (initialPath.current !== "/") {
      setVisible(false);
      setState("gone");
      return;
    }

    setVisible(true);
    shownAt.current = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
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
  }, []);

  useEffect(() => {
    const onLocaleChange = () => {
      localeChange.current = true;
      shownAt.current = performance.now();
      setNav(true);
      setState("show");
      setVisible(true);
    };
    window.addEventListener("drew:locale-change", onLocaleChange);
    return () => window.removeEventListener("drew:locale-change", onLocaleChange);
  }, []);

  useEffect(() => {
    if (!localeChange.current) return;
    localeChange.current = false;
    hide(NAV_MS);
  }, [pathname]);

  if (!visible || state === "gone") return null;
  return (
    <div
      className={`page-loader fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-black ${state === "fade" ? "page-loader-leave pointer-events-none" : ""} ${nav ? "page-loader-nav" : ""}`}
      aria-hidden={state === "fade"}
    >
      <div className="page-loader-mark">
        <Loader />
      </div>
    </div>
  );
}
