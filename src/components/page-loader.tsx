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

  useEffect(() => {
    const onRouteStart = () => {
      routeEverStarted.current = true;
      clearTimers();
      clearRouteTimers();
      routeTiming.current = {
        startedAt: performance.now(),
        minimumMs: FIRST_MIN_MS + Math.random() * (FIRST_MAX_MS - FIRST_MIN_MS),
      };
      setFading(false);
      setVisible(false);
    };

    const onRouteEnd = () => {
      const timing = routeTiming.current;
      routeTiming.current = null;
      if (!timing) return;

      const remaining = timing.startedAt + timing.minimumMs - performance.now();
      if (remaining <= 0) {
        setVisible(false);
        setFading(false);
        return;
      }

      setFading(false);
      setVisible(true);
      routeTimers.current.push(window.setTimeout(() => {
        setFading(true);
        routeTimers.current.push(window.setTimeout(() => {
          setVisible(false);
          setFading(false);
        }, ROUTE_FADE_MS));
      }, remaining));
    };

    window.addEventListener("drew:route-loading-start", onRouteStart);
    window.addEventListener("drew:route-loading-end", onRouteEnd);
    return () => {
      window.removeEventListener("drew:route-loading-start", onRouteStart);
      window.removeEventListener("drew:route-loading-end", onRouteEnd);
      clearRouteTimers();
    };
  }, [clearRouteTimers, clearTimers]);

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
