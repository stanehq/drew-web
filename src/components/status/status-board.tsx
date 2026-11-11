"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cloud,
  Database,
  Gauge,
  Layers,
  Search,
  Server,
  TriangleAlert,
  Users,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import type { PublicService, PublicShard, PublicStatus } from "@/lib/public-status";
import { formatCompact, formatExact, formatUptime } from "@/lib/format";
import { Aurora } from "@/components/aurora";

const REFRESH = 30;

const SERVICE_META: Record<string, { label: string; icon: typeof Cloud; detail: string }> = {
  gateway: { label: "Discord gateway", icon: Wifi, detail: "Connection to Discord" },
  api: { label: "API", icon: Zap, detail: "Configuration & dashboard API" },
  database: { label: "Database", icon: Database, detail: "Settings and history storage" },
  cache: { label: "Cache", icon: Layers, detail: "Sessions and rate limiting" },
};
const SERVICE_ORDER = ["gateway", "api", "database", "cache"];

const STATE = {
  operational: { text: "Operational", dot: "bg-brand", ring: "text-brand" },
  online: { text: "Online", dot: "bg-brand", ring: "text-brand" },
  degraded: { text: "Degraded", dot: "bg-warn", ring: "text-warn" },
  connecting: { text: "Connecting", dot: "bg-warn", ring: "text-warn" },
  down: { text: "Down", dot: "bg-bad", ring: "text-bad" },
  offline: { text: "Offline", dot: "bg-bad", ring: "text-bad" },
  not_configured: { text: "Not configured", dot: "bg-mute", ring: "text-mute" },
} as const;

function Dot({ state, pulse }: { state: keyof typeof STATE; pulse?: boolean }) {
  const s = STATE[state];
  return (
    <span className="relative inline-flex size-2.5 shrink-0">
      {pulse && <span className={`animate-pulse-ring absolute inline-flex size-full rounded-full ${s.dot}`} />}
      <span className={`relative inline-flex size-2.5 rounded-full ${s.dot}`} />
    </span>
  );
}

function SignalBars({ latency, status }: { latency: number; status: PublicShard["status"] }) {
  const level = status !== "online" ? 0 : latency < 80 ? 4 : latency < LATENCY_WARN_MS ? 3 : latency < LATENCY_BAD_MS ? 2 : 1;
  return (
    <span className="inline-flex items-end gap-[2px]" aria-hidden>
      {[1, 2, 3, 4].map((b) => (
        <span
          key={b}
          className={`w-[3px] ${b <= level ? (level >= 3 ? "bg-brand" : level === 2 ? "bg-warn" : "bg-bad") : "bg-white/12"}`}
          style={{ height: 3 + b * 2.5 }}
        />
      ))}
    </span>
  );
}

type Tone = "good" | "warn" | "bad" | "idle";

const TONE = {
  good: { text: "text-brand-bright", icon: "text-brand", bar: "bg-brand", border: "border-brand/30", pill: "bg-brand/10 text-brand ring-brand/30" },
  warn: { text: "text-warn", icon: "text-warn", bar: "bg-warn", border: "border-warn/40", pill: "bg-warn/10 text-warn ring-warn/30" },
  bad: { text: "text-bad", icon: "text-bad", bar: "bg-bad", border: "border-bad/40", pill: "bg-bad/10 text-bad ring-bad/30" },
  idle: { text: "text-fg", icon: "text-brand", bar: "bg-white/10", border: "", pill: "bg-white/[0.06] text-mute ring-line" },
} as const;

// Gateway latency: under 150 ms is healthy, 150 to 299 ms is elevated, 300 ms or more is high.
const LATENCY_WARN_MS = 150;
const LATENCY_BAD_MS = 300;

function latencyTone(ms: number): { tone: Tone; label: string } {
  if (!ms || ms <= 0) return { tone: "idle", label: "No data" };
  if (ms < 80) return { tone: "good", label: "Excellent" };
  if (ms < LATENCY_WARN_MS) return { tone: "good", label: "Good" };
  if (ms < LATENCY_BAD_MS) return { tone: "warn", label: "Elevated" };
  return { tone: "bad", label: "High" };
}

// Shards: all online is healthy, up to a quarter down is degraded, more is an outage.
function shardTone(online: number, total: number): { tone: Tone; label: string } {
  if (total === 0) return { tone: "idle", label: "No data" };
  const down = total - online;
  if (down === 0) return { tone: "good", label: "All online" };
  if (online === 0) return { tone: "bad", label: "All down" };
  return { tone: down / total > 0.25 ? "bad" : "warn", label: `${down} down` };
}

function shardForGuild(id: string, count: number) {
  if (!/^\d{17,20}$/.test(id) || count < 1) return null;
  return Number((BigInt(id) >> 22n) % BigInt(count));
}

export function StatusBoard({ initial, initialQuery = "" }: { initial: PublicStatus | null; initialQuery?: string }) {
  const [data, setData] = useState<PublicStatus | null>(initial);
  const [error, setError] = useState(false);
  // Without server-rendered data, the first tick (after 1s) loads it.
  const [countdown, setCountdown] = useState(initial ? REFRESH : 1);
  const [query, setQuery] = useState(initialQuery);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const json = res.ok ? ((await res.json()) as PublicStatus) : null;
      if (!json?.available) throw new Error("unavailable");
      setData(json);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          void load();
          return REFRESH;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [load]);

  const shards = useMemo(() => data?.shards ?? [], [data]);
  const online = shards.filter((s) => s.status === "online");
  const latencies = online.map((s) => s.latencyMs);
  const servicesDown = Object.values(data?.services ?? {}).filter((s) => s.status === "down").length;

  const overall: "operational" | "degraded" | "down" =
    !data || shards.length === 0 || online.length === 0
      ? "down"
      : online.length < shards.length || servicesDown > 0 || !data.ready || data.latencyMs >= LATENCY_BAD_MS
        ? "degraded"
        : "operational";
  const overallTitle = !data
    ? error
      ? "Status unavailable"
      : "Checking status"
    : { operational: "All systems operational", degraded: "Partial degradation", down: "Major outage" }[overall];

  const trimmed = query.trim();
  const target = trimmed ? shardForGuild(trimmed, data?.shardCount ?? 0) : null;
  const lookupInvalid = trimmed !== "" && target === null;


  const shardHealth = data ? shardTone(online.length, shards.length) : null;
  const latencyHealth = data ? latencyTone(data.latencyMs) : null;

  const kpis: {
    icon: typeof Server;
    label: string;
    value: string;
    suffix?: string;
    note: string;
    health?: { tone: Tone; label: string } | null;
  }[] = [
    { icon: Server, label: "Servers", value: data ? formatExact(data.guilds) : "...", note: data ? `across ${data.shardCount} shard${data.shardCount === 1 ? "" : "s"}` : "" },
    { icon: Users, label: "Members", value: data ? formatCompact(data.users) : "...", note: "across all servers" },
    {
      icon: Activity,
      label: "Shards online",
      value: data ? `${online.length}` : "...",
      suffix: data ? `/ ${shards.length}` : "",
      note: data ? `up ${formatUptime(data.uptimeSeconds)}` : "",
      health: shardHealth,
    },
    {
      icon: Gauge,
      label: "Gateway latency",
      value: data ? `${data.latencyMs}ms` : "...",
      note: latencies.length ? `${Math.min(...latencies)}ms fastest, ${Math.max(...latencies)}ms slowest` : "",
      health: latencyHealth,
    },
  ];

  return (
    <div className="noise relative isolate overflow-hidden">
      <div className="dot-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <Aurora className="-z-10 opacity-70" />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 sm:pt-36">
        {/* Header */}
        <div className="flex flex-col gap-8 border-b border-line pb-10 md:flex-row md:items-end md:justify-between">
          <div className="animate-fade-up">
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.02em] sm:text-6xl">
              Drew <span className="brand-text">status</span>
            </h1>
            <p className="mt-4 max-w-md text-soft">Live health of every shard and service, and the shard your server runs on</p>
          </div>
          <div className="w-full md:max-w-sm">
            <div className="surface flex items-center gap-2 px-4 focus-within:border-brand/50">
              <Search className="size-4 text-mute" />
              <input
                id="server-id"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Paste your server ID to find its shard"
                aria-label="Server ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full bg-transparent font-mono text-sm text-fg placeholder:text-mute focus:outline-none"
              />
            </div>
            <p className={`mt-2 min-h-5 text-xs ${lookupInvalid ?"text-bad":"text-soft"}`} aria-live="polite">
              {lookupInvalid
                ? "That doesn't look like a server ID."
                : target !== null
                  ? (
                    <>
                      Your server is on <span className="font-medium text-brand">shard {target}</span>
                      {shards[target] ? `, ${STATE[shards[target].status].text.toLowerCase()}` : ""}
                    </>
                  )
                  : ""}
            </p>
          </div>
        </div>

        {/* Overall */}
        <section
          className={`surface relative mt-10 overflow-hidden p-6 sm:p-8 ${overall ==="operational"?"border-brand/30": overall ==="degraded"?"border-warn/30":"border-bad/30"}`}
          aria-labelledby="overall"
        >
          <div
            className={`absolute -left-20 -top-24 size-72 rounded-full blur-3xl ${overall === "operational" ? "bg-brand/15" : overall === "degraded" ? "bg-warn/10" : "bg-bad/10"}`}
            aria-hidden
          />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-14 items-center justify-center border ${overall ==="operational"?"border-brand/30 bg-brand/10 text-brand": overall ==="degraded"?"border-warn/30 bg-warn/10 text-warn":"border-bad/30 bg-bad/10 text-bad"}`}
              >
                {overall === "operational" ? <CheckCircle2 className="size-7" /> : overall === "degraded" ? <TriangleAlert className="size-7" /> : <XCircle className="size-7" />}
              </div>
              <div>
                <h2 id="overall" className="text-2xl font-semibold tracking-tight">
                  {overallTitle}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-mute" aria-live="off">
              <svg viewBox="0 0 36 36" className="size-8 -rotate-90" aria-hidden>
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={94.2}
                  strokeDashoffset={94.2 * (1 - countdown / REFRESH)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
              Refreshing in {countdown}s
            </div>
          </div>

          <div className="relative mt-7 flex h-9 items-end gap-[3px]" role="img" aria-label={`${online.length} of ${shards.length} shards online`}>
            {(shards.length ? shards : Array.from({ length: 24 }, (_, i) => ({ id: i, status: "offline" as const, latencyMs: 0, guilds: 0, users: 0 }))).map((s) => (
              <span
                key={s.id}
                title={data ? `Shard ${s.id}, ${STATE[s.status].text}${s.status === "online" ? `, ${s.latencyMs}ms` : ""}` : undefined}
                className={`h-full flex-1 transition-all hover:opacity-80 ${!data ? "bg-white/[0.06]" : s.status === "online" ? (s.latencyMs >= LATENCY_WARN_MS ? "bg-warn" : "bg-brand") : s.status === "connecting" ? "bg-warn" : "bg-bad"} ${target === s.id ?"outline outline-2 outline-offset-2 outline-white":""}`}
              />
            ))}
          </div>
        </section>

        {/* KPIs */}
        <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Summary">
          {kpis.map(({ icon: Icon, label, value, suffix, note, health }) => {
            const t = TONE[health?.tone ?? "idle"];
            return (
              <div key={label} className={`surface relative overflow-hidden p-5 ${health ? t.border : ""}`}>
                {health && health.tone !== "idle" && <span className={`absolute inset-x-0 top-0 h-0.5 ${t.bar}`} aria-hidden />}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-mute">
                    <Icon className={`size-4 ${health ? t.icon : "text-brand"}`} />
                    <span className="text-xs">{label}</span>
                  </div>
                </div>
                <p className={`mt-3 text-3xl font-semibold tabular-nums tracking-tight ${health ? t.text : ""}`}>
                  {value}
                  {suffix && <span className="ml-1 text-lg font-medium text-mute">{suffix}</span>}
                </p>
                <p className="mt-1 min-h-4 text-xs text-mute">{note}</p>
              </div>
            );
          })}
        </section>

        {/* Services */}
        <section className="surface mt-5 overflow-hidden" aria-labelledby="services">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 id="services" className="font-semibold tracking-tight">
              Services
            </h2>
            <span className="text-xs text-mute">{data ? `${Object.keys(data.services).length} monitored` : ""}</span>
          </div>
          <ul className="divide-y divide-line">
            {(data ? [...SERVICE_ORDER.filter((k) => data.services[k]), ...Object.keys(data.services).filter((k) => !SERVICE_ORDER.includes(k))] : SERVICE_ORDER).map((key) => {
              const meta = SERVICE_META[key] ?? { label: key, icon: Cloud, detail: "" };
              const svc: PublicService | undefined = data?.services[key];
              const state = svc?.status ?? "not_configured";
              const Icon = meta.icon;
              return (
                <li key={key} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center border border-line bg-white/[0.03] text-soft">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-mute">{meta.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {svc && svc.status === "operational" && svc.latencyMs > 0 && (
                      <span className="hidden font-mono text-xs text-mute sm:inline">{svc.latencyMs}ms</span>
                    )}
                    <span className={`inline-flex items-center gap-2 border border-line px-3 py-1 text-xs ${STATE[state].ring}`}>
                      <Dot state={state} />
                      {data ? STATE[state].text : "..."}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Shards */}
        <section className="mt-12" aria-labelledby="shards">
          <div className="flex items-end justify-between">
            <div>
              <h2 id="shards" className="mt-2 text-2xl font-semibold tracking-tight">
                Shards
              </h2>
            </div>
            <div className="hidden items-center gap-4 text-xs text-mute sm:flex">
              <span className="inline-flex items-center gap-1.5"><Dot state="online" /> Online</span>
              <span className="inline-flex items-center gap-1.5"><Dot state="connecting" /> Connecting</span>
              <span className="inline-flex items-center gap-1.5"><Dot state="offline" /> Offline</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {shards.map((s) => (
              <article
                key={s.id}
                className={`surface surface-hover p-4 ${target === s.id ?"border-brand/60 shadow-[0_0_0_1px_var(--color-brand),0_12px_40px_-10px_rgb(65_207_139/0.5)]":""}`}
                aria-label={`Shard ${s.id}, ${STATE[s.status].text}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold tracking-tight">Shard {s.id}</h3>
                  <Dot state={s.status} pulse={s.status === "online"} />
                </div>
                <div className="mt-4 flex items-center justify-between font-mono text-xs">
                  <span className={`inline-flex items-center gap-2 ${s.status === "online" ? TONE[latencyTone(s.latencyMs).tone].text : "text-mute"}`}>
                    <SignalBars latency={s.latencyMs} status={s.status} />
                    {s.status === "online" ? `${s.latencyMs}ms` : STATE[s.status].text}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-mute">
                  <span className="inline-flex items-center gap-1.5"><Server className="size-3.5" /> {formatExact(s.guilds)}</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" /> {formatCompact(s.users)}</span>
                </div>
              </article>
            ))}
            {!shards.length &&
              Array.from({ length: 4 }, (_, i) => <div key={i} className="surface h-[124px] animate-pulse opacity-50" />)}
          </div>
        </section>
      </div>
    </div>
  );
}
