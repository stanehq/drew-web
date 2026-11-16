"use client";

import { useEffect, useState } from "react";
import { Flag, Hand, ShieldCheck, UserX } from "lucide-react";
import { formatCompact } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { CountUp } from "@/components/count-up";

type Stat = { key: string; total: number };

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

  // The cells are separated by 1px lines (the grid gap over a lighter background),
  // like the old stats panel: big number, name underneath, icon on top.
  return (
    <div className="mx-auto max-w-5xl px-5 pb-6">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-[#1b201d] sm:grid-cols-4">
        {stats.map((s, i) => {
          const meta = KNOWN[s.key];
          const Icon = meta?.icon ?? ShieldCheck;
          const label = meta ? t(meta.label) : titleCase(s.key);
          return (
            <li key={s.key} style={{ "--d": `${380 + i * 90}ms` } as React.CSSProperties} className="rise min-w-0 bg-[#0b0f0d] px-5 py-6 text-left sm:px-6 sm:py-7">
              <Icon className="drew-icon-gradient size-6 sm:size-7" strokeWidth={1.6} aria-hidden />
              <p className="mt-4">
                <span className="text-3xl font-bold tabular-nums leading-none tracking-[-0.02em] text-fg sm:text-[2.5rem]" title={s.total.toLocaleString("en")}>
                  <CountUp value={s.total} ms={1500} format={formatCompact} />
                </span>
              </p>
              <p className="mt-2 text-sm text-mute">{label}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
