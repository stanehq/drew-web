"use client";
import { ChevronDown } from "lucide-react";
import { LOCALES, useI18n } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const selected = LOCALES.find((item) => item.code === locale) ?? LOCALES[0];
  return (
    <label className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-[#202124] px-3 text-sm font-semibold text-fg hover:bg-[#292a2d]">
      <span className="text-xl leading-none" aria-hidden>{selected.flag}</span>
      <span>{selected.code.toUpperCase()}</span>
      <ChevronDown className="size-4 text-soft" />
      <span className="sr-only">{t("language")}</span>
      <select aria-label={t("language")} value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
        {LOCALES.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.label}</option>)}
      </select>
    </label>
  );
}
