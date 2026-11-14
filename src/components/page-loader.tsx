"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader } from "@/components/loader";
import { splitLocale } from "@/lib/locales";

const FIRST_MIN_MS = 3500;
const FIRST_MAX_MS = 4500;
const LOCALE_MS = 700;
const MAX_MS = 8000;
const ROUTE_FADE_MS = 900;

export function PageLoader() {
  const pathname = usePathname();
  const isHome = splitLocale(pathname)[1] === "/";
  const initialHome = useRef(isHome);
  const localeChange = useRef(false);
  const routeTiming = useRef<{ startedAt: number; minimumMs: number } | null>(null);
  const routeEverStarted = useRef(false);
  const shownAt = useRef(0);
  const timers = useRef<number[]>([]);
  const routeTimers = useRef<number[]>([]);
  const [visible, setVisible] = useState(() => isHome);
  const [fading, setFading] = useState(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const clearRouteTimers = useCallback(() => {
    routeTimers.current.forEach(window.clearTimeout);
    routeTimers.current = [];
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

  // Is the app/loading.tsx boundary currently showing (server data pending)?
  const routeLoading = useRef(false);

  const finishRoute = useCallback(() => {
    const timing = routeTiming.current;
    if (!timing || routeLoading.current) return;
    routeTiming.current = null;
    clearRouteTimers();
    const remaining = Math.max(0, timing.startedAt + timing.minimumMs - performance.now());
    routeTimers.current.push(window.setTimeout(() => {
      setFading(true);
      routeTimers.current.push(window.setTimeout(() => {
        setVisible(false);
        setFading(false);
      }, ROUTE_FADE_MS));
    }, remaining));
  }, [clearRouteTimers]);

  const startRoute = useCallback(() => {
    routeEverStarted.current = true;
    clearTimers();
    clearRouteTimers();
    if (!routeTiming.current) {
      routeTiming.current = {
        startedAt: performance.now(),
        minimumMs: FIRST_MIN_MS + Math.random() * (FIRST_MAX_MS - FIRST_MIN_MS),
      };
    }
    setFading(false);
    setVisible(true);
  }, [clearRouteTimers, clearTimers]);

  // Cover the screen the moment an internal link is clicked, before Next.js
  // has fetched anything, so neither page flashes in between.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === window.location.pathname) return; // same page or an #anchor
      startRoute();
    };
    const onRouteStart = () => {
      routeLoading.current = true;
      startRoute();
    };
    const onRouteEnd = () => {
      routeLoading.current = false;
      finishRoute();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("drew:route-loading-start", onRouteStart);
    window.addEventListener("drew:route-loading-end", onRouteEnd);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("drew:route-loading-start", onRouteStart);
      window.removeEventListener("drew:route-loading-end", onRouteEnd);
      clearRouteTimers();
    };
  }, [clearRouteTimers, finishRoute, startRoute]);

  // The new page is in place (and no server data is pending): let it go.
  useEffect(() => {
    finishRoute();
  }, [pathname, finishRoute]);

  // Back/forward with the browser buttons has no click: cover until the page changes.
  // The browser URL (with the language prefix) of the page on screen.
  const lastPath = useRef("");
  useEffect(() => {
    lastPath.current = window.location.pathname;
  }, [pathname]);
  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname !== lastPath.current) startRoute();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [startRoute]);

  useEffect(() => {
    if (!initialHome.current) {
      setVisible(false);
      return;
    }

    shownAt.current = performance.now();
    const firstMinimum = FIRST_MIN_MS + Math.random() * (FIRST_MAX_MS - FIRST_MIN_MS);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (routeEverStarted.current) return;
      hide(firstMinimum);
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

  useEffect(() => {
    const onLocaleChange = () => {
      localeChange.current = true;
      shownAt.current = performance.now();
      setFading(false);
      setVisible(true);
      timers.current.push(window.setTimeout(() => {
        localeChange.current = false;
        setFading(true);
        timers.current.push(window.setTimeout(() => {
          setVisible(false);
          setFading(false);
        }, 450));
      }, MAX_MS));
    };
    window.addEventListener("drew:locale-change", onLocaleChange);
    return () => window.removeEventListener("drew:locale-change", onLocaleChange);
  }, []);

  useEffect(() => {
    if (!localeChange.current) return;
    localeChange.current = false;
    hide(LOCALE_MS);
  }, [hide, pathname]);

  useEffect(() => () => {
    clearTimers();
    clearRouteTimers();
  }, [clearRouteTimers, clearTimers]);

  if (!visible) return null;
  return (
    <div
      className={"page-loader fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-black " + (fading ? "page-loader-leave pointer-events-none" : "")}
      aria-hidden={fading}
    >
      <div className="page-loader-mark">
        <Loader />
      </div>
    </div>
  );
}
