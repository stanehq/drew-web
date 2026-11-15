"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { formatCompact } from "@/lib/format";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";
import { SITE } from "@/lib/site";
import { BADGE, ServerBadge } from "@/components/server-badge";
import { TwoTone } from "@/components/two-tone";

function Avatar({ src, name, className }: { src?: string | null; name: string; className: string }) {
  return src ? (
    <Image src={src} alt="" width={96} height={96} className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-semibold text-soft ${className}`}>{name.slice(0, 1).toUpperCase()}</span>
  );
}

function Card({ item }: { item: Testimonial }) {
  const { t } = useI18n();
  const { server, quote, author } = item;
  const accent = item.color ?? (server.badge ? BADGE[server.badge].color : null);
  return (
    <figure className={`relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d0c] p-7 sm:p-8`}>
      {server.icon && (
        <Image src={server.icon} alt="" aria-hidden width={96} height={96} className={`pointer-events-none absolute left-1/2 top-1/3 size-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover blur-3xl saturate-150 opacity-10`} />
      )}
      {!server.icon && accent && (
        <span className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 90% at 0% 0%, ${accent}40, transparent 60%), linear-gradient(160deg, ${accent}1a, transparent 55%)` }} aria-hidden />
      )}
      <div className="relative flex items-center gap-4">
        <Avatar src={server.icon} name={t(server.name)} className="size-12" />
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold text-fg">
            <span className="truncate">{t(server.name)}</span>
            {server.badge && <ServerBadge badge={server.badge} />}
          </p>
          {server.members != null && <p className="text-sm text-mute">{formatCompact(server.members)} {t("members")}</p>}
        </div>
      </div>
      <blockquote className="relative my-6 flex-1 text-pretty text-[1.05rem] leading-relaxed text-white">
        <p>&ldquo;{t(quote)}&rdquo;</p>
      </blockquote>
      <figcaption className="relative">
        <p className="font-semibold text-white">{t(author.name)}</p>
        <p className="text-sm text-white/75">{t(author.role)}</p>
      </figcaption>
    </figure>
  );
}

/** Only publish quotes that are real and approved. Never fill this section with placeholder testimonials. */
export function Testimonials() {
  const { t } = useI18n();

  if (TESTIMONIALS.length === 0) {
    return (
      <section className="px-5 pb-28 pt-8 text-center">
        <h2 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">
          <TwoTone text={t("Loved by the communities that use it")} />
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-mute">
          {t("Your feedback helps us make Drew better. Share your experience with the team.")}
        </p>
        <a href={SITE.support} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/[0.06]">
          {t("Share your feedback")}
        </a>
      </section>
    );
  }

  return (
    <section className="px-5 pb-28">
      <h2 className="mx-auto max-w-3xl text-balance text-center text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">
        <TwoTone text={t("Loved by the communities that use it")} />
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-mute">{t("A look at the everyday challenges Drew is built to help communities handle.")}</p>
      <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
        {TESTIMONIALS.map((item, i) => <Card key={`${item.server.name}-${i}`} item={item} />)}
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-mute">
          {t("Your feedback helps us make Drew better. Share your experience with the team.")}
        </p>
        <a href={SITE.support} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">
          {t("Share your feedback")}
        </a>
      </div>
    </section>
  );
}
