"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
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
    <li className="flex h-[76px] w-[256px] shrink-0 items-center gap-3.5 rounded-[0.875rem] border border-brand/20 bg-[linear-gradient(135deg,rgb(65_207_139/0.10),rgb(65_207_139/0.02)_60%)] px-4 transition-colors hover:border-brand/50 sm:w-[280px]">
      {s.icon ? (
        <Image src={s.icon} alt="" width={44} height={44} className="size-11 shrink-0 rounded-[0.625rem] object-cover ring-1 ring-brand/30" />
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[0.625rem] bg-white/[0.06] text-base font-semibold text-soft">
          {s.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-[0.95rem] font-semibold text-fg">
          <span className="truncate">{s.name}</span>
          {(s.verified || s.partnered) && <BadgeCheck className="size-4 shrink-0 text-brand" aria-label={s.verified ? "Verified" : "Partnered"} />}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[0.8rem] text-mute">
          <span className="font-semibold text-brand-bright">{formatCompact(s.members)}</span> {members(s.members)}
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
