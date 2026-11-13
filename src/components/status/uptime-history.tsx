"use client";

import { useEffect, useState } from "react";
import type { PublicMetricPoint } from "@/lib/public-metrics";
import { useI18n } from "@/lib/i18n";

const DAYS = 30;
const DAY = 86400;

// Per UTC day: the most shards that were down at the same time, out of how many.
type Day = { start: number; down: number | null; total: number };

function toDays(points: PublicMetricPoint[], now: number): Day[] {
  const today = Math.floor(now / DAY) * DAY;
  return Array.from({ length: DAYS }, (_, i) => {
    const start = today - (DAYS - 1 - i) * DAY;
    const inDay = points.filter((p) => p.t >= start && p.t < start + DAY && p.shardsTotal > 0);
    if (!inDay.length) return { start, down: null, total: 0 };
    return {
      start,
      down: Math.max(...inDay.map((p) => Math.max(0, p.shardsTotal - p.shardsOnline))),
      total: Math.max(...inDay.map((p) => p.shardsTotal)),
    };
  });
}

// Green: every shard up. Yellow: under half of the shards down. Red: half or more down.
const tone = (d: Day) =>
  d.down === null ? "bg-white/[0.08]" : d.down === 0 ? "bg-brand" : d.down / d.total < 0.5 ? "bg-warn" : "bg-bad";

/** Shard health for the last 30 days, one segment per day, from the public metrics history. */
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

  const known = days?.filter((d) => d.down !== null) ?? [];
  const clean = known.filter((d) => d.down === 0).length;
  const fmtDay = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <div>
      <div className="flex h-2 gap-1" role="img" aria-label={`${t("Last 30 days")}: ${clean}/${known.length} ${t("days with every shard online")}`}>
        {(days ?? Array.from({ length: DAYS }, (_, i) => ({ start: i, down: null, total: 0 }))).map((d) => (
          <span
            key={d.start}
            title={
              days
                ? `${fmtDay(d.start)}: ${d.down === null ? t("No data") : d.down === 0 ? t("All shards online") : `${d.down}/${d.total} ${t("shards down")}`}`
                : undefined
            }
            className={`h-full flex-1 rounded-full ${days ? tone(d) : "bg-white/[0.08]"}`}
          />
        ))}
      </div>
      <div className="mt-2.5 flex justify-between text-xs text-mute">
        <span>{t("Last 30 days")}</span>
        <span>{t("Today")}</span>
      </div>
    </div>
  );
}
