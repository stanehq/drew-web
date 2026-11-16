"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Activity, Gauge, Hash, Server, ShieldCheck, Terminal, TrendingUp, Users } from "lucide-react";
import type { PublicMetricPoint, PublicMetrics } from "@/lib/public-metrics";
import { useI18n } from "@/lib/i18n";
import { formatCompact, formatExact } from "@/lib/format";
import { TwoTone } from "@/components/two-tone";

const RANGES = ["24h", "7d", "30d", "90d"] as const;
type Range = (typeof RANGES)[number];
const RANGE_LABEL: Record<Range, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days", "90d": "90 days" };
const REFRESH_MS = 120_000;

type ChartPoint = PublicMetricPoint & { perServer: number };
type Series = { key: keyof ChartPoint; label: string; icon: typeof Server; unit?: string; bars?: boolean };

const fmtTime = (t: number, range: Range) =>
  new Date(t * 1000).toLocaleString("en", range === "24h" ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" });
const fmtFull = (t: number) =>
  new Date(t * 1000).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** Smooth line through the points (monotone cubic, so it never overshoots the data). */
function smoothPath(pts: [number, number][]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n < 3) return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    slope.push(dx[i] === 0 ? 0 : (pts[i + 1][1] - pts[i][1]) / dx[i]);
  }
  const tan: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) tan.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  tan.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tan[i] = 0;
      tan[i + 1] = 0;
      continue;
    }
    const a = tan[i] / slope[i];
    const b = tan[i + 1] / slope[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      tan[i] = (3 * a * slope[i]) / h;
      tan[i + 1] = (3 * b * slope[i]) / h;
    }
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const w = dx[i] / 3;
    d += `C${(pts[i][0] + w).toFixed(1)},${(pts[i][1] + tan[i] * w).toFixed(1)} ${(pts[i + 1][0] - w).toFixed(1)},${(pts[i + 1][1] - tan[i + 1] * w).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}

function Chart({ points, series, range }: { points: ChartPoint[]; series: Series; range: Range }) {
  const { t } = useI18n();
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 180;
  const PAD = { l: 44, r: 8, t: 12, b: 24 };
  const values = points.map((p) => Number(p[series.key]));
  const max = Math.max(1, ...values);
  const min = series.bars ? 0 : Math.min(...values);
  const span = Math.max(1, max - min);
  const flat = max === min;
  const lo = series.bars || flat ? 0 : Math.max(0, min - span * 0.15);
  const hi = flat ? Math.max(2, Math.ceil(max * 1.25)) : max + span * 0.15;
  const x = (i: number) => PAD.l + (points.length <= 1 ? (W - PAD.l - PAD.r) / 2 : (i / (points.length - 1)) * (W - PAD.l - PAD.r));
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
  const ticks = [lo, (lo + hi) / 2, hi].filter((t, i, a) => a.findIndex((u) => Math.round(u) === Math.round(t)) === i);
  const line = smoothPath(values.map((v, i) => [x(i), y(v)] as [number, number]));
  const area = `${line}L${x(values.length - 1).toFixed(1)},${H - PAD.b}L${x(0).toFixed(1)},${H - PAD.b}Z`;
  const barW = Math.max(2, ((W - PAD.l - PAD.r) / Math.max(points.length, 1)) * 0.6);
  const h = hover != null ? points[hover] : null;
  const fmt = (v: number) => (series.unit ? `${Math.round(v)} ${series.unit}` : formatExact(Math.round(v)));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label={`${t(series.label)} · ${t("over the last")} ${t(RANGE_LABEL[range])}`}
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (points.length - 1));
          setHover(Math.min(points.length - 1, Math.max(0, i)));
        }}
      >
        <defs>
          <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7ee8b5" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7ee8b5" stopOpacity="0" />
          </linearGradient>
          {/* Green on the left fading to white on the right, in absolute units so flat lines get it too */}
          <linearGradient id={`l${id}`} gradientUnits="userSpaceOnUse" x1={PAD.l} x2={W - PAD.r} y1="0" y2="0">
            <stop offset="0%" stopColor="#35c98d" />
            <stop offset="55%" stopColor="#7ee8b5" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.06)" />
            <text x={PAD.l - 8} y={y(t) + 3.5} textAnchor="end" className="fill-mute font-sans text-[10px]">
              {series.unit || hi < 100_000 ? formatExact(Math.round(t)) : formatCompact(Math.round(t))}
            </text>
          </g>
        ))}
        {series.bars ? (
          values.map((v, i) => (
            <rect
              key={points[i].t}
              x={x(i) - barW / 2}
              y={y(v)}
              width={barW}
              height={Math.max(0, H - PAD.b - y(v))}
              rx={1.5}
              fill={hover === i ? "#ffffff" : `url(#l${id})`} fillOpacity={hover === i ? 1 : 0.85}
            />
          ))
        ) : (
          <>
            <path d={area} fill={`url(#g${id})`} className="chart-area" />
            <path d={line} pathLength={1} className="chart-line" fill="none" stroke={`url(#l${id})`} strokeWidth={1.9} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i && points[v])
          .map((i) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} className="fill-mute font-sans text-[10px]">
              {fmtTime(points[i].t, range)}
            </text>
          ))}
        {h && hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="rgb(255 255 255 / 0.18)" strokeDasharray="3 3" />
            {!series.bars && <circle cx={x(hover)} cy={y(values[hover])} r={3.5} fill="#000000" stroke="#ffffff" strokeWidth={2} />}
          </g>
        )}
      </svg>
      {h && (
        <div className="pointer-events-none absolute right-2 top-0 rounded-lg border border-white/10 bg-ink/90 px-2.5 py-1.5 text-right text-xs backdrop-blur">
          <p className="font-sans text-[10px] text-mute">{fmtFull(h.t)}</p>
          <p className="font-medium text-fg">{fmt(Number(h[series.key]))}</p>
        </div>
      )}
    </div>
  );
}


const CHARTS: Series[] = [
  { key: "guilds", label: "Servers", icon: Server },
  { key: "users", label: "Members", icon: Users },
  { key: "channels", label: "Channels", icon: Hash },
  { key: "latencyMs", label: "Gateway latency", icon: Gauge, unit: "ms" },
  { key: "perServer", label: "Members per server", icon: TrendingUp },
  { key: "commands", label: "Commands", icon: Terminal },
];


export function MetricsBoard({ initial, initialRange }: { initial: PublicMetrics | null; initialRange: Range }) {
  const { t } = useI18n();
  const [range, setRange] = useState<Range>(initialRange);
  // Keep what was loaded for every range, so coming back to one shows its data right away.
  const [byRange, setByRange] = useState<Partial<Record<Range, PublicMetrics>>>(initial ? { [initialRange]: initial } : {});
  const data = byRange[range] ?? null;
  const skipFirstLoad = useRef(!!initial);
  const [failed, setFailed] = useState(false);
  const rangeListRef = useRef<HTMLDivElement>(null);
  const rangeButtonRefs = useRef<Partial<Record<Range, HTMLButtonElement | null>>>({});
  const [rangeBox, setRangeBox] = useState<{ left: number; width: number } | null>(null);
  const [rangeAnimate, setRangeAnimate] = useState(false);

  const measureRange = useCallback((value: Range) => {
    const button = rangeButtonRefs.current[value];
    const list = rangeListRef.current;
    if (!button || !list) return null;
    const listRect = list.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return { left: buttonRect.left - listRect.left, width: buttonRect.width };
  }, []);

  useLayoutEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      setRangeAnimate(false);
      setRangeBox(measureRange(range));
      secondFrame = requestAnimationFrame(() => {
        setRangeBox(measureRange(range));
        setRangeAnimate(true);
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [measureRange, range]);

  useEffect(() => {
    const update = () => setRangeBox(measureRange(range));
    const observer = rangeListRef.current ? new ResizeObserver(update) : null;
    if (rangeListRef.current) observer?.observe(rangeListRef.current);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [measureRange, range]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/metrics?range=${range}`, { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<PublicMetrics>) : Promise.reject(new Error(String(r.status)))))
        .then((d) => {
          if (!alive) return;
          setByRange((prev) => ({ ...prev, [d.range]: d }));
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));
    // The page already came with the first range, every other visit (including coming back to it) loads fresh data.
    if (skipFirstLoad.current && range === initialRange) skipFirstLoad.current = false;
    else void load();
    const t = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [range, initialRange]);

  const pick = (r: Range) => {
    setRange(r);
    const u = new URL(window.location.href);
    if (r === "24h") u.searchParams.delete("range");
    else u.searchParams.set("range", r);
    window.history.replaceState(null, "", u);
  };

  const points = useMemo(() => data?.points ?? [], [data]);
  const chartPoints = useMemo<ChartPoint[]>(() => points.map((p) => ({ ...p, perServer: p.guilds ? p.users / p.guilds : 0 })), [points]);
  const stats = useMemo(() => {
    const first = points[0];
    const last = points[points.length - 1];
    const latencies = points.map((p) => p.latencyMs).filter((v) => v > 0);
    const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const healthy = points.filter((p) => p.shardsTotal > 0 && p.shardsOnline >= p.shardsTotal).length;
    const availability = points.length ? (healthy / points.length) * 100 : 0;
    const spanHours = first && last ? Math.max(1, (last.t - first.t) / 3600) : 1;
    return {
      first,
      last,
      perHour: points.reduce((sum, point) => sum + point.commands, 0) / spanHours,
      avgLatency,
      best: latencies.length ? Math.min(...latencies) : 0,
      worst: latencies.length ? Math.max(...latencies) : 0,
      availability,
    };
  }, [points]);
  const cur = data?.current;
  // Each chart shows its latest value (commands: the total for the period), so the snapshot above does not repeat them.
  const headline = (s: Series) => {
    const last = chartPoints[chartPoints.length - 1];
    if (!last) return "";
    if (s.key === "commands") return formatCompact(chartPoints.reduce((sum, p) => sum + p.commands, 0));
    const v = Number(last[s.key]);
    return s.unit ? `${Math.round(v)} ${s.unit}` : s.key === "perServer" ? formatExact(Math.round(v)) : formatCompact(v);
  };

  // While the figures are still loading (or there is no history yet) every card shows the same placeholder.
  const loading = !data || points.length < 2;
  const kpis = [
    { label: "Commands per hour", icon: TrendingUp, value: formatCompact(Math.round(stats.perHour)) },
    { label: "Commands run", icon: Terminal, value: formatCompact(cur?.commandsUsed ?? 0) },
    { label: "Avg latency", icon: Gauge, value: `${Math.round(stats.avgLatency || cur?.latencyMs || 0)} ms` },
    { label: "Availability", icon: ShieldCheck, value: `${stats.availability.toFixed(stats.availability === 100 ? 0 : 2)}%` },
  ];

  return (
    <section className="relative isolate overflow-hidden pt-[76px]">
      <div className="mx-auto max-w-6xl px-5 pb-28">
        <div className="flex flex-col items-center gap-8 pb-10 pt-20 text-center">
          <div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.025em] sm:text-6xl"><TwoTone text={t("Drew in numbers")} /></h1>
            <p className="mx-auto mt-4 max-w-lg text-balance text-soft">{t("Public, aggregate figures sampled every five minutes, no server or user data")}</p>
          </div>
          <div
            ref={rangeListRef}
            role="tablist"
            aria-label="Time range"
            className="relative flex w-fit gap-1 rounded-xl border border-white/10 p-1"
            onMouseLeave={() => setRangeBox(measureRange(range))}
          >
            {rangeBox && (
              <span
                aria-hidden
                className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white/10 will-change-[left,width] ${rangeAnimate ? "transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""}`}
                style={{ left: rangeBox.left, width: rangeBox.width }}
              />
            )}
            {RANGES.map((r) => (
              <button
                key={r}
                ref={(el) => {
                  rangeButtonRefs.current[r] = el;
                }}
                role="tab"
                aria-selected={range === r}
                onClick={() => pick(r)}
                onMouseEnter={() => setRangeBox(measureRange(r))}
                onFocus={() => setRangeBox(measureRange(r))}
                className={`relative z-10 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${range === r ? "text-fg" : "text-soft hover:text-fg"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <section aria-labelledby="metrics-snapshot">
          <h2 id="metrics-snapshot" className="mb-3 font-sans text-sm font-semibold text-soft">{t("Current snapshot")}</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map(({ label, icon: Icon, value, suffix }: { label: string; icon: typeof Server; value: string; suffix?: string }, i) => (
            <div key={label} style={{ "--d": `${i * 70}ms` } as React.CSSProperties} className="rise lift surface min-w-0 p-5 sm:p-6">
              <p className="flex items-center gap-2 text-xs text-mute">
                <Icon className="drew-icon-gradient size-3.5" /> {t(label)}{suffix}
              </p>
              <p className="mt-4 truncate font-sans text-2xl font-semibold leading-none tabular-nums tracking-[-0.02em] sm:text-3xl">{loading ? "..." : value}</p>
            </div>
          ))}
          </div>
        </section>

        {points.length < 2 ? (
          <div className="surface mt-3 flex flex-col items-center gap-3 px-6 py-20 text-center">
            <Activity className="drew-icon-gradient size-6" />
            <p className="font-medium">{failed || !data ? t("Metrics are unavailable right now.") : t("Collecting data...")}</p>
            {(failed || !data) && (
              <p className="max-w-sm text-sm text-mute">{t("We couldn't reach the bot. This page retries automatically.")}</p>
            )}
          </div>
        ) : (
          <section className="mt-8" aria-labelledby="metrics-history">
            <h2 id="metrics-history" className="mb-3 font-sans text-sm font-semibold text-soft">{t("Trends over time")} <span className="font-normal text-mute">· {t(RANGE_LABEL[range])}</span></h2>
            <div className="grid gap-3 lg:grid-cols-2">
            {CHARTS.map((s, i) => (
              <article key={`${range}-${s.key}`} style={{ "--d": `${(i % 2) * 90 + Math.floor(i / 2) * 70}ms` } as React.CSSProperties} className="rise lift surface min-w-0 p-5 sm:p-6">
                <header className="mb-3 flex items-center justify-between">
                  <h2 className="font-sans flex items-center gap-2 text-sm font-medium">
                    <s.icon className="drew-icon-gradient size-4" /> {t(s.label)}
                  </h2>
                  <span className="font-sans text-lg font-semibold tabular-nums text-fg">{headline(s)}</span>
                </header>
                <Chart key={range} points={chartPoints} series={s} range={range} />
              </article>
            ))}
            </div>
          </section>
        )}
        {failed && data && <p className="py-3 text-center text-xs text-warn">{t("Showing the last data we received. Retrying...")}</p>}
      </div>
    </section>
  );
}
