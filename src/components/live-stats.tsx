"use client";

import { useEffect, useState } from "react";
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
    { label: "Servers", value: stats ? formatCompact(stats.guilds) : "..." },
    { label: "Members protected", value: stats ? formatCompact(stats.users) : "..." },
    { label: "Commands run", value: stats ? formatCompact(stats.commandsUsed) : "..." },
    { label: "Uptime", value: stats ? formatUptime(stats.uptimeSeconds) : "..." },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="bg-ink px-6 py-7 text-left">
            <p className="font-display text-3xl font-semibold tabular-nums tracking-[-0.02em] text-fg sm:text-4xl">{it.value}</p>
            <p className="mt-1.5 text-sm text-mute">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
