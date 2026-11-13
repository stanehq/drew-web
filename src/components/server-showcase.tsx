"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatExact } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { CountUp } from "@/components/count-up";
import { ServerBadge } from "@/components/server-badge";
import type { Badge } from "@/lib/public-showcase";

type Server = { name: string; icon: string | null; members: number; badge: Badge | null };

const SECONDS_PER_CARD = 3.2;
// Enough cards per row to cover a wide screen without the same server showing twice.
const MIN_CARDS = 7;
// Two rows only when each row gets its own servers, otherwise one row.
const TWO_ROWS_FROM = 14;

function ServerCard({ s, members }: { s: Server; members: (n: number) => string }) {
  return (
    <li className="flex w-[300px] shrink-0 items-center gap-4 px-2 sm:w-[340px]">
      {s.icon ? (
        <Image src={s.icon} alt="" width={84} height={84} className="size-[72px] shrink-0 rounded-full object-cover sm:size-[84px]" />
      ) : (
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-2xl font-semibold text-soft sm:size-[84px]">
          {s.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-lg font-semibold text-fg sm:text-xl">
          <span className="truncate">{s.name}</span>
          {s.badge && <ServerBadge badge={s.badge} />}
        </p>
        <p className="mt-0.5 text-[0.95rem] text-mute">
          <span className="tabular-nums">{formatExact(s.members)}</span> {members(s.members)}
        </p>
      </div>
    </li>
  );
}

function Row({ track, members, reverse = false }: { track: Server[]; members: (n: number) => string; reverse?: boolean }) {
  return (
    <div
      className={`flex w-max animate-marquee gap-10 ${reverse ? "[animation-direction:reverse]" : ""}`}
      style={{ animationDuration: `${track.length * SECONDS_PER_CARD}s` }}
    >
      {[0, 1].map((copy) => (
        <ul key={copy} className="flex gap-10" aria-hidden={copy === 1 || reverse || undefined}>
          {track.map((s, i) => (
            <ServerCard key={`${copy}-${i}`} s={s} members={members} />
          ))}
        </ul>
      ))}
    </div>
  );
}

/** Full-bleed looping marquee of the largest servers using Drew. */
export function ServerShowcase() {
  const { t } = useI18n();
  const [servers, setServers] = useState<Server[]>([]);
  const [totals, setTotals] = useState({ servers: 0, people: 0 });

  useEffect(() => {
    let alive = true;
    fetch("/api/showcase")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { servers?: Server[]; total?: number; totalMembers?: number } | null) => {
        if (!alive || !Array.isArray(d?.servers)) return;
        setServers(d.servers);
        const totals = { servers: Number(d.total) || 0, people: Number(d.totalMembers) || 0 };
        setTotals(totals);
        // Older bot builds don't send totalMembers: fall back to the live stats.
        if (!totals.people)
          fetch("/api/stats")
            .then((r) => (r.ok ? r.json() : null))
            .then((st: { available?: boolean; users?: number; guilds?: number } | null) => {
              if (alive && st?.available) setTotals({ servers: totals.servers || Number(st.guilds) || 0, people: Number(st.users) || 0 });
            })
            .catch(() => {});
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (servers.length === 0) return null;
  const fill = (list: Server[]) => Array.from({ length: Math.ceil(MIN_CARDS / list.length) }, () => list).flat();
  const rows = servers.length >= TWO_ROWS_FROM ? [servers.filter((_, i) => i % 2 === 0), servers.filter((_, i) => i % 2 === 1)] : [servers];
  const members = (n: number) => (n === 1 ? t("member") : t("members"));
  return (
    <div className="w-full overflow-hidden pb-4 pt-12" aria-label="Servers using Drew">
      {totals.servers > 0 && totals.people > 0 && (
        <div className="mb-12 px-5 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/[0.06] px-3 py-1 text-xs font-medium text-brand-bright">
            <span className="relative flex size-2">
              <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-brand" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            {t("Live")}
          </p>
          <h2 className="mx-auto mt-5 max-w-4xl text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.025em] text-fg sm:text-5xl">
            {t("Protecting")} <span className="drew-wordmark"><CountUp value={totals.people} /></span> {t("people across")}{" "}
            <span className="drew-wordmark"><CountUp value={totals.servers} ms={900} /></span> {t("communities")}
          </h2>
        </div>
      )}
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 py-2 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {rows.map((list, i) => (
          <Row key={i} track={fill(list)} members={members} reverse={i === 1} />
        ))}
      </div>
    </div>
  );
}
