"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { DE, ES, FR, PT, RU, US } from "country-flag-icons/react/3x2";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";

// SVG flags (emoji flags render as letters on Windows).
const FLAGS: Record<Locale, typeof US> = { en: US, es: ES, pt: PT, fr: FR, de: DE, ru: RU };

function Flag({ code, className = "" }: { code: Locale; className?: string }) {
  const F = FLAGS[code];
  return <F aria-hidden className={`shrink-0 overflow-hidden rounded-[3px] ring-1 ring-white/15 ${className}`} />;
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = LOCALES.find((item) => item.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("language")}: ${selected.label}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 px-3 text-sm text-soft transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-fg"
      >
        <Flag code={selected.code} className="h-[14px] w-[21px]" />
        {!compact && <span>{selected.label}</span>}
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[19rem] rounded-2xl border border-white/10 bg-[#0d1117] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
          <p className="px-2 pb-2 pt-1 text-xs capitalize text-mute">{t("language")}</p>
          <ul role="listbox" aria-label={t("language")} className="grid grid-cols-2 gap-1">
            {LOCALES.map((item) => {
              const active = item.code === locale;
              return (
                <li key={item.code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale(item.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors ${
                      active ? "bg-brand/10 text-fg ring-1 ring-inset ring-brand/40" : "text-soft hover:bg-white/[0.05] hover:text-fg"
                    }`}
                  >
                    <Flag code={item.code} className="h-[18px] w-[27px]" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && <Check className="size-3.5 text-brand" strokeWidth={2.25} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
