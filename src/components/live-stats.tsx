"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatCompact, formatUptime } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

type Stats = { available: boolean; ready: boolean; guilds: number; users: number; commandsUsed: number; uptimeSeconds: number; latencyMs: number };

export function LiveStats() {
  const { t } = useI18n();
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
    <div className="relative isolate">
      <Image src="/brand/drew-icon.svg" alt="" aria-hidden width={144} height={144} priority className="pointer-events-none absolute left-1/2 top-0 z-0 size-28 -translate-x-1/2 -translate-y-[58%] rotate-[-9deg] opacity-45 drop-shadow-[0_0_28px_rgb(65_207_139/0.35)] sm:size-36" />
      <div className="relative z-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.06] sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="min-w-0 bg-ink px-6 py-7 text-left">
            <p className="truncate whitespace-nowrap text-3xl font-bold tabular-nums tracking-[-0.02em] text-fg sm:text-[2.5rem] sm:leading-tight" title={it.value}>{it.value}</p>
            <p className="mt-1.5 text-sm text-mute">{t(it.label)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
