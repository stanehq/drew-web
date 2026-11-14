"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Flag, Hand, ShieldCheck, UserX } from "lucide-react";
import { formatCompact } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

type Stat = { key: string; total: number; last7d: number };

// Known counters get a proper name and icon. Any other counter the API returns
// is shown too, with its key turned into a title ("spam_blocked" -> "Spam Blocked").
const KNOWN: Record<string, { label: string; icon: typeof ShieldCheck }> = {
  raids_stopped: { label: "Raids Stopped", icon: ShieldCheck },
  nukes_stopped: { label: "Nukes Stopped", icon: Hand },
  members_quarantined: { label: "Members Quarantined", icon: UserX },
  accounts_flagged: { label: "Accounts Flagged", icon: Flag },
};
const titleCase = (key: string) => key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** What Drew has done for its communities, as counters returned by the bot API. */
export function ProtectionStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((s: { available?: boolean; protection?: Stat[] } | null) => {
          if (alive && s?.available && Array.isArray(s.protection) && s.protection.length) setStats(s.protection);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  // Nothing to show until the bot reports counters (older bot builds don't).
  if (!stats) return null;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-6">
      {/* One row on desktop (up to 4 across, then it wraps), two columns on tablets, one on phones */}
      <ul
        className="grid grid-cols-1 gap-x-8 gap-y-6 rounded-2xl border border-white/10 bg-[#0b0f0d]/80 px-6 py-6 backdrop-blur sm:grid-cols-2 sm:px-8 sm:py-7 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ ["--cols" as string]: Math.min(stats.length, 4) }}
      >
        {stats.map((s) => {
          const meta = KNOWN[s.key];
          const Icon = meta?.icon ?? ShieldCheck;
          const label = meta ? t(meta.label) : titleCase(s.key);
          return (
            <li key={s.key} className="flex min-w-0 items-center gap-3.5">
              <Icon className="drew-icon-gradient size-8 shrink-0 sm:size-9" strokeWidth={1.5} aria-hidden />
              <div className="min-w-0">
                <p className="text-balance text-base font-medium leading-tight text-fg sm:text-lg">{label}</p>
                <p className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold tabular-nums leading-none tracking-tight text-fg">{formatCompact(s.total)}</span>
                  {s.last7d > 0 && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2 py-0.5 text-xs font-medium tabular-nums text-fg"
                      title={t("in the last 7 days")}
                    >
                      <ArrowUp className="size-3 text-brand" strokeWidth={2.5} aria-hidden />
                      {formatCompact(s.last7d)}
                    </span>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
