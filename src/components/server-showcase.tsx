"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Users } from "lucide-react";
import { formatCompact } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

type Server = { name: string; icon: string | null; members: number; verified: boolean; partnered: boolean };

const SECONDS_PER_CARD = 3.2;
// Enough cards per row to cover a wide screen without the same server showing twice.
const MIN_CARDS = 7;
// Two rows only when each row gets its own servers, otherwise one row.
const TWO_ROWS_FROM = 14;

function ServerCard({ s, members, delay }: { s: Server; members: (n: number) => string; delay: number }) {
  const style = { animationDelay: `${-delay}s` };
  return (
    <li className="slime relative h-[112px] w-[300px] shrink-0 overflow-hidden sm:h-[124px] sm:w-[360px]" style={style}>
      {/* Outline: the server icon blurred and spinning, or a soft white light without one */}
      <span className="slime-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2" style={style} aria-hidden>
        {s.icon ? (
          <Image src={s.icon} alt="" width={64} height={64} className="size-full object-cover blur-xl saturate-150" />
        ) : (
          <span className="block size-full bg-[conic-gradient(from_0deg,transparent_0%,rgb(255_255_255/0.35)_12%,transparent_30%,transparent_55%,rgb(255_255_255/0.2)_68%,transparent_85%)]" />
        )}
      </span>
      <div className="absolute inset-[2px] flex items-center gap-4 overflow-hidden rounded-[inherit] bg-[#0a0c0b] px-5">
        {s.icon && (
          <Image src={s.icon} alt="" aria-hidden width={64} height={64} className="pointer-events-none absolute -left-10 top-1/2 size-48 -translate-y-1/2 object-cover opacity-25 blur-2xl saturate-150" />
        )}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,#0a0c0b_70%)]" aria-hidden />
        {s.icon ? (
          <Image src={s.icon} alt="" width={68} height={68} className="relative size-[60px] shrink-0 rounded-full object-cover shadow-[0_8px_24px_rgb(0_0_0/0.5)] ring-2 ring-white/10 sm:size-[68px]" />
        ) : (
          <span className="relative flex size-[60px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xl font-semibold text-soft ring-2 ring-white/[0.06] sm:size-[68px]">
            {s.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="relative min-w-0">
          <p className="flex items-center gap-1.5 truncate text-[1.05rem] font-semibold text-fg sm:text-lg">
            <span className="truncate">{s.name}</span>
            {(s.verified || s.partnered) && <BadgeCheck className="size-[18px] shrink-0 text-brand" aria-label={s.verified ? "Verified" : "Partnered"} />}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-mute">
            <Users className="size-4" aria-hidden />
            <span className="tabular-nums text-soft">{formatCompact(s.members)}</span> {members(s.members)}
          </p>
        </div>
      </div>
    </li>
  );
}

function Row({ track, members, reverse = false }: { track: Server[]; members: (n: number) => string; reverse?: boolean }) {
  return (
    <div
      className={`flex w-max animate-marquee gap-4 ${reverse ? "[animation-direction:reverse]" : ""}`}
      style={{ animationDuration: `${track.length * SECONDS_PER_CARD}s` }}
    >
      {[0, 1].map((copy) => (
        <ul key={copy} className="flex gap-4" aria-hidden={copy === 1 || reverse || undefined}>
          {track.map((s, i) => (
            <ServerCard key={`${copy}-${i}`} s={s} members={members} delay={(i * 1.7) % 7} />
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
    <div className="w-full overflow-hidden pb-24 pt-12" aria-label="Servers using Drew">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 py-2 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {rows.map((list, i) => (
          <Row key={i} track={fill(list)} members={members} reverse={i === 1} />
        ))}
      </div>
    </div>
  );
}
