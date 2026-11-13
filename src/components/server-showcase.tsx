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
    <li className="group flex h-[84px] w-[300px] shrink-0 items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 transition-colors hover:border-brand/40 hover:bg-white/[0.04] sm:w-[320px]">
      {s.icon ? (
        <Image src={s.icon} alt="" width={52} height={52} className="size-[52px] shrink-0 rounded-xl object-cover ring-1 ring-white/10" />
      ) : (
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lg font-semibold text-soft ring-1 ring-white/10">
          {s.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate font-semibold text-fg">
          <span className="truncate">{s.name}</span>
          {(s.verified || s.partnered) && <BadgeCheck className="size-4 shrink-0 text-brand" aria-label={s.verified ? "Verified" : "Partnered"} />}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-mute">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden /> {formatCompact(s.members)} {members(s.members)}
        </p>
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
    <section className="w-full overflow-hidden py-10" aria-label="Servers using Drew">
      <div className="flex flex-col gap-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        {rows.map((list, i) => (
          <Row key={i} track={fill(list)} members={members} reverse={i === 1} />
        ))}
      </div>
    </section>
  );
}
