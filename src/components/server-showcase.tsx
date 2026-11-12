"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Users } from "lucide-react";
import { formatCompact } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

type Server = { name: string; icon: string | null; members: number; verified: boolean; partnered: boolean };

const SECONDS_PER_CARD = 2.6;
const MIN_CARDS = 8;

function ServerCard({ s, members }: { s: Server; members: string }) {
  return (
    <li className="flex h-[108px] w-[360px] shrink-0 items-center gap-5 rounded-[24px] border border-white/[0.035] bg-[#151619] px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:w-[396px]">
      {s.icon ? (
        <Image src={s.icon} alt="" width={72} height={72} className="size-[72px] shrink-0 rounded-[18px] object-cover" />
      ) : (
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-[18px] bg-white/[0.05] font-display text-xl font-semibold text-soft">
          {s.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-[1.05rem] font-semibold text-fg">
          <span className="truncate">{s.name}</span>
          {(s.verified || s.partnered) && <BadgeCheck className="size-4 shrink-0 text-brand" aria-label={s.verified ? "Verified" : "Partnered"} />}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-mute">
          <Users className="size-3.5" /> {formatCompact(s.members)} {members}
        </p>
      </div>
    </li>
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
  const track = Array.from({ length: Math.ceil(MIN_CARDS / servers.length) }, () => servers).flat();
  const members = t("members");
  return (
    <section className="w-full overflow-hidden border-b border-line" aria-label="Servers using Drew">
      <div className="relative w-full overflow-hidden py-8 [mask-image:linear-gradient(90deg,transparent,black_3%,black_97%,transparent)]">
        <div className="flex w-max animate-marquee gap-5" style={{ animationDuration: `${track.length * SECONDS_PER_CARD}s` }}>
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex gap-5" aria-hidden={copy === 1 || undefined}>
              {track.map((s, i) => (
                <ServerCard key={`${copy}-${i}`} s={s} members={members} />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
