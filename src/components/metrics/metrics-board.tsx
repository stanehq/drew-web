"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Activity, Gauge, Server, Terminal, Users } from "lucide-react";
import type { PublicMetricPoint, PublicMetrics } from "@/lib/public-metrics";
import { formatCompact, formatExact } from "@/lib/format";
import { Aurora } from "@/components/aurora";

const RANGES = ["24h", "7d", "30d", "90d"] as const;
type Range = (typeof RANGES)[number];
const RANGE_LABEL: Record<Range, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days", "90d": "90 days" };
const REFRESH_MS = 120_000;

type Series = { key: keyof PublicMetricPoint; label: string; icon: typeof Server; unit?: string; bars?: boolean };

const fmtTime = (t: number, range: Range) =>
  new Date(t * 1000).toLocaleString("en", range === "24h" ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" });
const fmtFull = (t: number) =>
  new Date(t * 1000).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

function Chart({ points, series, range }: { points: PublicMetricPoint[]; series: Series; range: Range }) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 180;
  const PAD = { l: 44, r: 8, t: 12, b: 24 };
  const values = points.map((p) => Number(p[series.key]));
  const max = Math.max(1, ...values);
  const min = series.bars ? 0 : Math.min(...values);
  const span = Math.max(1, max - min);
  const lo = series.bars ? 0 : Math.max(0, min - span * 0.15);
  const hi = max + span * 0.15;
  const x = (i: number) => PAD.l + (points.length <= 1 ? (W - PAD.l - PAD.r) / 2 : (i / (points.length - 1)) * (W - PAD.l - PAD.r));
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
  const ticks = [lo, (lo + hi) / 2, hi];
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
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
        aria-label={`${series.label} over the last ${RANGE_LABEL[range]}`}
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
            <stop offset="0%" stopColor="#41cf8b" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#41cf8b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.06)" />
            <text x={PAD.l - 8} y={y(t) + 3.5} textAnchor="end" className="fill-mute font-mono text-[10px]">
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
              className={hover === i ? "fill-brand-bright" : "fill-brand/70"}
            />
          ))
        ) : (
          <>
            <path d={area} fill={`url(#g${id})`} />
            <path d={line} fill="none" stroke="#41cf8b" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i && points[v])
          .map((i) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} className="fill-mute font-mono text-[10px]">
              {fmtTime(points[i].t, range)}
            </text>
          ))}
        {h && hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="rgb(255 255 255 / 0.18)" strokeDasharray="3 3" />
            {!series.bars && <circle cx={x(hover)} cy={y(values[hover])} r={3.5} fill="#7ee8b5" stroke="#050807" strokeWidth={2} />}
          </g>
        )}
      </svg>
      {h && (
        <div className="pointer-events-none absolute right-2 top-0 rounded-lg border border-line bg-ink/90 px-2.5 py-1.5 text-right text-xs backdrop-blur">
          <p className="font-mono text-[10px] text-mute">{fmtFull(h.t)}</p>
          <p className="font-medium text-fg">{fmt(Number(h[series.key]))}</p>
        </div>
      )}
    </div>
  );
}

function Delta({ now, before, invert }: { now: number; before: number; invert?: boolean }) {
  if (!before) return null;
  const d = now - before;
  if (d === 0) return <span className="text-xs text-mute">no change</span>;
  const good = invert ? d < 0 : d > 0;
  const pct = Math.abs((d / before) * 100);
  return (
    <span className={`text-xs font-medium ${good ? "text-brand" : "text-bad"}`}>
      {d > 0 ? "+" : "−"}
      {pct < 0.1 ? "<0.1" : pct.toFixed(1)}%
    </span>
  );
}

const CHARTS: Series[] = [
  { key: "guilds", label: "Servers", icon: Server },
  { key: "users", label: "Members", icon: Users },
  { key: "commands", label: "Commands", icon: Terminal, bars: true },
  { key: "latencyMs", label: "Gateway latency", icon: Gauge, unit: "ms" },
];

export function MetricsBoard({ initial, initialRange }: { initial: PublicMetrics | null; initialRange: Range }) {
  const [range, setRange] = useState<Range>(initialRange);
  const [data, setData] = useState<PublicMetrics | null>(initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/metrics?range=${range}`, { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<PublicMetrics>) : Promise.reject(new Error(String(r.status)))))
        .then((d) => {
          if (!alive) return;
          setData(d);
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));
    if (range !== initialRange || !initial) void load();
    const t = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [range, initialRange, initial]);

  const pick = (r: Range) => {
    setRange(r);
    const u = new URL(window.location.href);
    if (r === "24h") u.searchParams.delete("range");
    else u.searchParams.set("range", r);
    window.history.replaceState(null, "", u);
  };

  const points = useMemo(() => (data?.range === range ? data.points : []), [data, range]);
  const first = points[0];
  const last = points[points.length - 1];
  const commandsInRange = points.reduce((s, p) => s + p.commands, 0);
  const avgLatency = points.length ? points.reduce((s, p) => s + p.latencyMs, 0) / points.length : 0;
  const cur = data?.current;

  const kpis = [
    { label: "Servers", icon: Server, value: formatExact(cur?.guilds ?? 0), delta: first && last && <Delta now={last.guilds} before={first.guilds} /> },
    { label: "Members", icon: Users, value: formatCompact(cur?.users ?? 0), delta: first && last && <Delta now={last.users} before={first.users} /> },
    { label: `Commands · ${range}`, icon: Terminal, value: formatCompact(commandsInRange), delta: <span className="text-xs text-mute">{formatCompact(cur?.commandsUsed ?? 0)} since restart</span> },
    { label: "Avg latency", icon: Gauge, value: `${Math.round(avgLatency || cur?.latencyMs || 0)} ms`, delta: <span className="text-xs text-mute">{cur ? `${cur.shardsOnline}/${cur.shardsTotal} shards online` : ""}</span> },
  ];

  return (
    <section className="noise relative isolate overflow-hidden pb-24 pt-32 sm:pt-36">
      <div className="dot-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
      <Aurora className="-z-10 opacity-50" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="animate-fade-up flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Metrics</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Drew in numbers.</h1>
            <p className="mt-3 max-w-xl text-soft">Public, aggregate figures sampled every five minutes. No server or user data is shown.</p>
          </div>
          <div role="tablist" aria-label="Time range" className="flex w-fit rounded-full border border-line bg-white/[0.03] p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => pick(r)}
                className={`rounded-full px-4 py-1.5 font-mono text-xs transition-colors ${range === r ? "bg-brand text-[#03110a]" : "text-soft hover:text-fg"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map(({ label, icon: Icon, value, delta }) => (
            <div key={label} className="surface min-w-0 p-5">
              <p className="flex items-center gap-2 text-xs text-mute">
                <Icon className="size-3.5 text-brand" /> {label}
              </p>
              <p className="mt-3 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{data ? value : "—"}</p>
              <div className="mt-1 h-4">{data && delta}</div>
            </div>
          ))}
        </div>

        {points.length < 2 ? (
          <div className="surface mt-4 flex flex-col items-center gap-3 px-6 py-20 text-center">
            <Activity className="size-6 text-brand" />
            <p className="font-medium">{failed || !data ? "Metrics are unavailable right now." : "Collecting data…"}</p>
            <p className="max-w-sm text-sm text-mute">
              {failed || !data
                ? "We couldn't reach the bot. This page retries automatically."
                : "Drew records a sample every five minutes. Charts appear once there are enough points for this range."}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {CHARTS.map((s) => (
              <article key={s.key} className="surface min-w-0 p-5">
                <header className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-medium">
                    <s.icon className="size-4 text-brand" /> {s.label}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">{RANGE_LABEL[range]}</span>
                </header>
                <Chart points={points} series={s} range={range} />
              </article>
            ))}
          </div>
        )}
        {failed && data && <p className="mt-4 text-center text-xs text-warn">Showing the last data we received; retrying…</p>}
      </div>
    </section>
  );
}
