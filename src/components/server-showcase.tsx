import Image from "next/image";
import { BadgeCheck, Users } from "lucide-react";
import { formatCompact } from "@/lib/format";
import type { PublicServer, PublicShowcase } from "@/lib/public-showcase";

function ServerCard({ s }: { s: PublicServer }) {
  return (
    <li className="flex w-[290px] shrink-0 items-center gap-4 border border-line bg-night px-5 py-4">
      {s.icon ? (
        <Image src={s.icon} alt="" width={52} height={52} className="size-[52px] shrink-0 border border-line" />
      ) : (
        <span className="flex size-[52px] shrink-0 items-center justify-center border border-line bg-white/[0.04] font-display text-lg font-semibold text-soft">
          {s.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate font-medium text-fg">
          <span className="truncate">{s.name}</span>
          {(s.verified || s.partnered) && (
            <BadgeCheck className="size-4 shrink-0 text-brand" aria-label={s.verified ? "Verified" : "Partnered"} />
          )}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-mute">
          <Users className="size-3.5" /> {formatCompact(s.members)} members
        </p>
      </div>
    </li>
  );
}

/** Looping marquee of the largest public servers using Drew. */
export function ServerShowcase({ data }: { data: PublicShowcase }) {
  const { servers, total } = data;
  if (servers.length === 0) return null;
  const animate = servers.length >= 4;
  return (
    <section className="border-b border-line" aria-labelledby="showcase-title">
      <div className="mx-auto max-w-6xl border-x border-line">
        <div className="flex flex-col gap-2 px-4 pb-8 pt-14 text-center sm:px-8">
          <p className="eyebrow">Trusted by communities</p>
          <h2 id="showcase-title" className="text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Protecting {total > 0 ? `${formatCompact(total)} servers` : "servers"}, including these.
          </h2>
        </div>
        <div
          className={`group relative overflow-hidden border-t border-line py-8 ${
            animate ? "[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" : ""
          }`}
        >
          {animate ? (
            <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
              {/* The list is rendered twice so the loop is seamless. */}
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex gap-4" aria-hidden={copy === 1 || undefined}>
                  {servers.map((s, i) => (
                    <ServerCard key={`${copy}-${i}`} s={s} />
                  ))}
                </ul>
              ))}
            </div>
          ) : (
            <ul className="flex flex-wrap justify-center gap-4 px-4">
              {servers.map((s, i) => (
                <ServerCard key={i} s={s} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
