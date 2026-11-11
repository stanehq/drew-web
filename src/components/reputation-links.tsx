"use client";
import { ExternalLink, Star } from "lucide-react";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export function ReputationLinks() {
  const { t } = useI18n();
  return (
    <section className="border-b border-line" aria-label="Community platforms">
      <div className="mx-auto grid max-w-6xl gap-px border-x border-line bg-line md:grid-cols-2">
        <a href={SITE.topgg} target="_blank" rel="noreferrer" className="group flex min-h-40 items-center justify-between gap-6 bg-ink p-7 transition-colors hover:bg-night sm:p-9">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand">Top.gg</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-fg">{t("topgg")}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-soft">{t("topggDescription")}</p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand group-hover:-translate-y-1"><Star className="size-5" /></span>
        </a>
        <div className="flex min-h-40 items-center justify-between gap-6 bg-ink p-7 sm:p-9">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-soft">Trustpilot</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-fg">{t("trustpilot")}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-mute">{t("trustpilotPending")}</p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-night text-mute"><ExternalLink className="size-5" /></span>
        </div>
      </div>
    </section>
  );
}
