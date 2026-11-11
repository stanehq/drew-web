"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCompact, formatUptime } from "@/lib/format";

type Stats = { available: boolean; ready: boolean; guilds: number; users: number; commandsUsed: number; uptimeSeconds: number; latencyMs: number };

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((s: Stats | null) => alive && s?.available && setStats(s))
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const items = [
    { label: "Servers", value: stats ? formatCompact(stats.guilds) : "—" },
    { label: "Members protected", value: stats ? formatCompact(stats.users) : "—" },
    { label: "Commands run", value: stats ? formatCompact(stats.commandsUsed) : "—" },
    { label: "Uptime", value: stats ? formatUptime(stats.uptimeSeconds) : "—" },
  ];

  return (
    <div className="surface mx-auto w-full max-w-3xl overflow-hidden">
      <div className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-line sm:[&>*]:border-b-0">
        {items.map((it) => (
          <div key={it.label} className="px-5 py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-fg">{it.value}</p>
            <p className="mt-1 text-xs text-mute">{it.label}</p>
          </div>
        ))}
      </div>
      <Link
        href="/status"
        className="flex items-center justify-center gap-2 border-t border-line px-4 py-2.5 text-xs text-mute transition-colors hover:text-fg"
      >
        <span className="relative flex size-2">
          <span className={`absolute inline-flex size-full rounded-full ${stats?.ready ? "animate-pulse-ring bg-brand" : ""}`} />
          <span className={`relative inline-flex size-2 rounded-full ${stats ? (stats.ready ? "bg-brand" : "bg-warn") : "bg-mute"}`} />
        </span>
        {stats ? (stats.ready ? `All systems operational · ${stats.latencyMs}ms` : "Connecting to Discord") : "Checking status"}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
