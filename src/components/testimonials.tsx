"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { formatCompact } from "@/lib/format";
import { EXAMPLES, TESTIMONIALS, type Testimonial } from "@/lib/testimonials";
import { SITE } from "@/lib/site";
import { BADGE, ServerBadge } from "@/components/server-badge";

function Avatar({ src, name, className }: { src?: string | null; name: string; className: string }) {
  return src ? (
    <Image src={src} alt="" width={96} height={96} className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-semibold text-soft ${className}`}>{name.slice(0, 1).toUpperCase()}</span>
  );
}

function Card({ item, featured }: { item: Testimonial; featured: boolean }) {
  const { t } = useI18n();
  const { server, quote, author } = item;
  const accent = item.color ?? (server.badge ? BADGE[server.badge].color : null);
  return (
    <figure className={`relative mb-5 flex break-inside-avoid flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d0c] p-7 ${featured ? "sm:min-h-[560px] sm:p-9" : ""}`}>
      {/* The server icon, heavily blurred, gives each card its own light */}
      {server.icon && (
        <Image src={server.icon} alt="" aria-hidden width={96} height={96} className={`pointer-events-none absolute left-1/2 top-1/3 size-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover blur-3xl saturate-150 ${featured ? "opacity-25" : "opacity-10"}`} />
      )}
      {/* Each card is lit by its own colour, from the top left into the dark */}
      {!server.icon && accent && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 0% 0%, ${accent}${featured ? "59" : "40"}, transparent 60%), linear-gradient(160deg, ${accent}1a, transparent 55%)`,
          }}
          aria-hidden
        />
      )}
      <div className="relative flex items-center gap-4">
        <Avatar src={server.icon} name={server.name} className={featured ? "size-16 text-xl" : "size-12"} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold text-fg">
            <span className="truncate">{server.name}</span>
            {server.badge && <ServerBadge badge={server.badge} />}
          </p>
          <p className="text-sm text-mute">
            {formatCompact(server.members)} {t("members")}
          </p>
        </div>
      </div>
      <blockquote className={`relative my-8 flex-1 text-pretty leading-relaxed text-fg/90 ${featured ? "flex items-center text-xl sm:text-2xl" : "text-[1.02rem]"}`}>
        <p>&ldquo;{quote}&rdquo;</p>
      </blockquote>
      <figcaption className="relative flex items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-fg">{author.name}</p>
          <p className="text-sm text-mute">{t(author.role)}</p>
        </div>
        <Avatar src={author.avatar} name={author.name} className="size-11" />
      </figcaption>
    </figure>
  );
}

/** Quotes from the communities that use Drew, or lorem ipsum placeholders until there are real ones. */
export function Testimonials() {
  const { t } = useI18n();
  const items = TESTIMONIALS.length ? TESTIMONIALS : EXAMPLES;
  return (
    <section className="px-5 pb-28">
      <h2 className="mx-auto max-w-3xl text-balance text-center text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">
        {t("Loved by the communities that use it")}
      </h2>
      <div className="mx-auto mt-14 max-w-5xl columns-1 gap-5 md:columns-2">
        {items.map((item, i) => (
          <Card key={`${item.server.name}-${i}`} item={item} featured={i === 0} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-mute">
        {t("Using Drew?")}{" "}
        <a href={SITE.support} target="_blank" rel="noopener" className="text-brand-bright underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
          {t("Share your feedback")}
        </a>
      </p>
    </section>
  );
}
