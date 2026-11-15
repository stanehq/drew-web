"use client";

import { ShieldCheck, ClipboardList, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const USE_CASES = [
  {
    icon: ShieldCheck,
    title: "Protection against raids",
    description: "Layer verification, invite filtering and anti-raid response to help keep sudden attacks under control.",
  },
  {
    icon: ClipboardList,
    title: "Clear moderation history",
    description: "Keep moderation activity and configuration changes easier to review when your team needs context.",
  },
  {
    icon: SlidersHorizontal,
    title: "One consistent setup",
    description: "Manage automod presets and server profiles without piecing together a collection of separate tools.",
  },
] as const;

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="px-5 pb-28">
      <h2 className="mx-auto max-w-3xl text-balance text-center text-4xl font-semibold tracking-[-0.025em] text-white sm:text-6xl">
        {t("Built for safer communities")}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-mute">
        {t("The problems Drew is designed to help server teams handle every day.")}
      </p>
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {USE_CASES.map(({ icon: Icon, title, description }) => (
          <article key={title} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c] p-7 transition-colors hover:border-brand/35">
            <div className="mb-7 inline-flex size-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10">
              <Icon className="size-5 text-brand-bright" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t(title)}</h3>
            <p className="mt-3 text-sm leading-6 text-white/75">{t(description)}</p>
          </article>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-mute">
        {t("Using Drew?")}{" "}
        <a href={SITE.support} target="_blank" rel="noopener noreferrer" className="text-brand-bright underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
          {t("Share your feedback")}
        </a>
      </p>
    </section>
  );
}
