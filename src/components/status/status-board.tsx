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
import { useI18n } from "@/lib/i18n";
import { TwoTone } from "@/components/two-tone";

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
  const { t } = useI18n();
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
      note: "",
      health: latencyHealth,
    },
  ];

  const tone = overall === "operational" ? "good" : overall === "degraded" ? "warn" : "bad";
  const banner = {
    good: "bg-brand/[0.08] ring-brand/25 text-brand",
    warn: "bg-warn/[0.08] ring-warn/30 text-warn",
    bad: "bg-bad/[0.08] ring-bad/30 text-bad",
  }[tone];

  return (
    <div className="relative isolate">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(50%_60%_at_50%_0%,rgb(65_207_139/0.12),transparent_70%)]" aria-hidden />
      <div className="mx-auto max-w-4xl px-5 pb-28 pt-36 sm:pt-40">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.025em] sm:text-6xl"><TwoTone text={t("Drew status")} /></h1>
          <p className="mx-auto mt-4 max-w-lg text-balance text-soft">{t("Live health of every shard and service, and the shard your server runs on")}</p>
          <div className="mx-auto mt-8 max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 focus-within:border-brand/50">
              <Search className="size-4 text-mute" />
              <input
                id="server-id"
                inputMode="numeric"
                autoComplete="off"
                placeholder={t("Paste your server ID to find its shard")}
                aria-label={t("Server ID")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full bg-transparent text-sm text-fg placeholder:text-mute focus:outline-none"
              />
            </div>
            <p className={`mt-2 min-h-5 text-sm ${lookupInvalid ? "text-bad" : "text-soft"}`} aria-live="polite">
              {lookupInvalid ? (
                t("That doesn't look like a server ID")
              ) : target !== null ? (
                <>
                  {t("Your server is on ")}
                  <span className="font-medium text-brand">{t("shard ")}{target}</span>
                  {shards[target] ? `, ${t(STATE[shards[target].status].text).toLowerCase()}` : ""}
                </>
              ) : (
                ""
              )}
            </p>
          </div>
        </div>

        {/* Overall */}
        <section className={`mt-10 rounded-2xl p-6 ring-1 ring-inset sm:p-8 ${banner}`} aria-labelledby="overall">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {tone === "good" ? <CheckCircle2 className="size-7" /> : tone === "warn" ? <TriangleAlert className="size-7" /> : <XCircle className="size-7" />}
              <h2 id="overall" className="font-sans text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                {t(overallTitle)}
              </h2>
            </div>
            <span className="text-sm text-mute" aria-live="off">
              {t("Refreshing in ")}
              {countdown}s
            </span>
          </div>
          <div className="mt-6 flex h-2 gap-1" role="img" aria-label={`${online.length} of ${shards.length} shards online`}>
            {(shards.length ? shards : Array.from({ length: 12 }, (_, i) => ({ id: i, status: "offline" as const, latencyMs: 0, guilds: 0, users: 0 }))).map((s) => (
              <span
                key={s.id}
                title={data ? `Shard ${s.id}, ${t(STATE[s.status].text)}${s.status === "online" ? `, ${s.latencyMs}ms` : ""}` : undefined}
                className={`h-full flex-1 rounded-full ${!data ? "bg-white/[0.08]" : s.status === "online" ? (s.latencyMs >= LATENCY_WARN_MS ? "bg-warn" : "bg-brand") : s.status === "connecting" ? "bg-warn" : "bg-bad"} ${target === s.id ? "ring-2 ring-white ring-offset-2 ring-offset-ink" : ""}`}
              />
            ))}
          </div>
        </section>

        {/* Numbers: one quiet panel */}
        <section className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-4" aria-label="Summary">
          {kpis.map(({ icon: Icon, label, value, suffix, note, health }, i) => (
            <div key={label} className={`p-5 sm:p-6 ${i % 2 ? "border-l border-white/10" : ""} ${i >= 2 ? "border-t border-white/10 sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}>
              <p className="flex items-center gap-1.5 text-sm text-mute">
                <Icon className="size-4" strokeWidth={1.75} /> {t(label)}
              </p>
              <p className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${health ? TONE[health.tone].text : "text-fg"}`}>
                {value}
                {suffix && <span className="ml-1 text-base font-normal text-mute">{suffix}</span>}
              </p>
              {note && <p className="mt-1 text-xs text-mute">{note}</p>}
            </div>
          ))}
        </section>

        {/* Services */}
        <section className="mt-14" aria-labelledby="services">
          <h2 id="services" className="font-sans text-lg font-semibold tracking-tight">
            {t("Services")}
          </h2>
          <ul className="mt-4 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10">
            {(data ? [...SERVICE_ORDER.filter((k) => data.services[k]), ...Object.keys(data.services).filter((k) => !SERVICE_ORDER.includes(k))] : SERVICE_ORDER).map((key) => {
              const meta = SERVICE_META[key] ?? { label: key, icon: Cloud, detail: "" };
              const svc: PublicService | undefined = data?.services[key];
              const state = svc?.status ?? "not_configured";
              const Icon = meta.icon;
              return (
                <li key={key} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-mute" strokeWidth={1.75} />
                    <div>
                      <p className="text-sm font-medium">{t(meta.label)}</p>
                      <p className="text-xs text-mute">{t(meta.detail)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {svc && svc.status === "operational" && svc.latencyMs > 0 && <span className="hidden text-xs text-mute sm:inline">{svc.latencyMs}ms</span>}
                    <span className={`inline-flex items-center gap-2 text-sm ${STATE[state].ring}`}>
                      <Dot state={state} />
                      {data ? t(STATE[state].text) : "..."}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Shards */}
        <section className="mt-14" aria-labelledby="shards">
          <div className="flex items-end justify-between">
            <h2 id="shards" className="font-sans text-lg font-semibold tracking-tight">
              {t("Shards")}
            </h2>
            <div className="hidden items-center gap-4 text-xs text-mute sm:flex">
              <span className="inline-flex items-center gap-1.5"><Dot state="online" /> {t("Online")}</span>
              <span className="inline-flex items-center gap-1.5"><Dot state="connecting" /> {t("Connecting")}</span>
              <span className="inline-flex items-center gap-1.5"><Dot state="offline" /> {t("Offline")}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {shards.map((s) => (
              <article
                key={s.id}
                className={`rounded-xl border p-4 transition-colors ${target === s.id ? "border-brand/70 bg-brand/[0.06]" : "border-white/10 hover:border-white/20"}`}
                aria-label={`Shard ${s.id}, ${t(STATE[s.status].text)}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-sm font-semibold">Shard {s.id}</h3>
                  <Dot state={s.status} pulse={s.status === "online"} />
                </div>
                <p className={`mt-3 inline-flex items-center gap-2 text-sm ${s.status === "online" ? TONE[latencyTone(s.latencyMs).tone].text : "text-mute"}`}>
                  <SignalBars latency={s.latencyMs} status={s.status} />
                  {s.status === "online" ? `${s.latencyMs}ms` : t(STATE[s.status].text)}
                </p>
                <p className="mt-3 flex items-center justify-between text-xs text-mute">
                  <span className="inline-flex items-center gap-1.5"><Server className="size-3.5" /> {formatExact(s.guilds)}</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" /> {formatCompact(s.users)}</span>
                </p>
              </article>
            ))}
            {!shards.length && Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[108px] animate-pulse rounded-xl border border-white/10" />)}
          </div>
        </section>
      </div>
    </div>
  );
}
