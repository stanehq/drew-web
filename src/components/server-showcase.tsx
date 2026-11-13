"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Users } from "lucide-react";
import { formatCompact } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

type Server = { name: string; icon: string | null; members: number; verified: boolean; partnered: boolean };

const SECONDS_PER_CARD = 2.6;
// Enough cards per row to cover a wide screen without the same server showing twice.
const MIN_CARDS = 7;
// Two rows only when each row gets its own servers, otherwise one row.
const TWO_ROWS_FROM = 14;

function ServerCard({ s, members }: { s: Server; members: (n: number) => string }) {
  return (
    <li className="relative flex h-[88px] w-[264px] shrink-0 items-center gap-3.5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0d0c] px-4 sm:w-[290px]">
      {/* The server's own icon, blurred, tints its card so every card has its own color */}
      {s.icon && (
        <Image src={s.icon} alt="" aria-hidden width={64} height={64} className="pointer-events-none absolute -left-6 top-1/2 size-40 -translate-y-1/2 scale-150 object-cover opacity-30 blur-2xl saturate-150" />
      )}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,#0b0d0c_75%)]" aria-hidden />
      {s.icon ? (
        <Image src={s.icon} alt="" width={52} height={52} className="relative size-[52px] shrink-0 rounded-full object-cover shadow-[0_6px_20px_rgb(0_0_0/0.45)] ring-2 ring-white/10" />
      ) : (
        <span className="relative flex size-[52px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-lg font-semibold text-soft ring-2 ring-white/[0.06]">
          {s.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="relative min-w-0">
        <p className="flex items-center gap-1.5 truncate text-[0.98rem] font-semibold text-fg">
          <span className="truncate">{s.name}</span>
          {(s.verified || s.partnered) && <BadgeCheck className="size-4 shrink-0 text-brand" aria-label={s.verified ? "Verified" : "Partnered"} />}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[0.82rem] text-mute">
          <Users className="size-3.5" aria-hidden />
          <span className="tabular-nums text-soft">{formatCompact(s.members)}</span> {members(s.members)}
        </p>
      </div>
    </li>
  );
}

function Row({ track, members, reverse = false }: { track: Server[]; members: (n: number) => string; reverse?: boolean }) {
  return (
    <div
      className={`flex w-max animate-marquee gap-3 ${reverse ? "[animation-direction:reverse]" : ""}`}
      style={{ animationDuration: `${track.length * SECONDS_PER_CARD}s` }}
    >
      {[0, 1].map((copy) => (
        <ul key={copy} className="flex gap-3" aria-hidden={copy === 1 || reverse || undefined}>
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

  useEffect(() => {
    let alive = true;
    fetch("/api/showcase")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { servers?: Server[] } | null) => alive && Array.isArray(d?.servers) && setServers(d.servers))
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
    <div className="w-full overflow-hidden pb-20 pt-10" aria-label="Servers using Drew">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {rows.map((list, i) => (
          <Row key={i} track={fill(list)} members={members} reverse={i === 1} />
        ))}
      </div>
    </div>
  );
}
