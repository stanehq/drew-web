"use client";

import { useI18n } from "@/lib/i18n";
import { TwoTone } from "@/components/two-tone";

/** Legal page title in the visitor's language, and a note that the text itself is English. */
export function LegalHeading({ title, updated }: { title: string; updated: string | null }) {
  const { t, locale } = useI18n();
  return (
    <header className="pt-20 text-center">
      <h1 className="text-balance text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">
        <TwoTone text={t(title)} />
      </h1>
      {updated && <p className="mt-3 text-sm text-mute">{updated}</p>}
      {locale !== "en" && <p className="mx-auto mt-3 max-w-lg text-sm text-mute">{t("This document is only available in English, which is the version that applies.")}</p>}
    </header>
  );
}
