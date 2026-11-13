"use client";

import { useEffect, useState } from "react";
import type { PublicMetricPoint } from "@/lib/public-metrics";
import { useI18n } from "@/lib/i18n";

const DAYS = 30;
const DAY = 86400;
const LATENCY_WARN_MS = 150;

type Day = { start: number; availability: number | null; worstLatency: number };

/** Groups metric samples into UTC days: share of shards online and worst latency. */
function toDays(points: PublicMetricPoint[], now: number): Day[] {
  const today = Math.floor(now / DAY) * DAY;
  return Array.from({ length: DAYS }, (_, i) => {
    const start = today - (DAYS - 1 - i) * DAY;
    const inDay = points.filter((p) => p.t >= start && p.t < start + DAY && p.shardsTotal > 0);
    if (!inDay.length) return { start, availability: null, worstLatency: 0 };
    const availability = inDay.reduce((n, p) => n + Math.min(1, p.shardsOnline / p.shardsTotal), 0) / inDay.length;
    return { start, availability, worstLatency: Math.max(...inDay.map((p) => p.latencyMs)) };
  });
}

const tone = (d: Day) =>
  d.availability === null
    ? "bg-white/[0.08]"
    : d.availability < 0.95
      ? "bg-bad"
      : d.availability < 0.999 || d.worstLatency >= LATENCY_WARN_MS
        ? "bg-warn"
        : "bg-brand";

/** Last 30 days of availability as one bar per day, from the public metrics history. */
export function UptimeHistory() {
  const { t, locale } = useI18n();
  const [days, setDays] = useState<Day[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/metrics?range=30d")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { available?: boolean; points?: PublicMetricPoint[]; to?: number } | null) => {
        if (alive && d?.available && Array.isArray(d.points)) setDays(toDays(d.points, d.to ?? Date.now() / 1000));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const known = days?.filter((d) => d.availability !== null) ?? [];
  const avg = known.length ? (known.reduce((n, d) => n + (d.availability ?? 0), 0) / known.length) * 100 : null;
  const fmtDay = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <div>
      <div className="flex h-9 items-end gap-[3px]" role="img" aria-label={avg !== null ? `${avg.toFixed(2)}% ${t("uptime")}, ${t("last 30 days")}` : t("last 30 days")}>
        {(days ?? Array.from({ length: DAYS }, (_, i) => ({ start: i, availability: null, worstLatency: 0 }))).map((d) => (
          <span
            key={d.start}
            title={
              days
                ? `${fmtDay(d.start)}: ${d.availability === null ? t("No data") : `${(d.availability * 100).toFixed(2)}% ${t("uptime")}`}${d.worstLatency ? `, ${t("worst latency")} ${d.worstLatency}ms` : ""}`
                : undefined
            }
            className={`h-full flex-1 rounded-[3px] transition-opacity hover:opacity-70 ${days ? tone(d) : "bg-white/[0.08]"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-mute">
        <span>{t("30 days ago")}</span>
        {avg !== null && <span className="text-soft">{avg.toFixed(2)}% {t("uptime")}</span>}
        <span>{t("Today")}</span>
      </div>
    </div>
  );
}
