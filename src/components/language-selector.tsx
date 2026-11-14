"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { DE, ES, FR, PT, RU, US } from "country-flag-icons/react/3x2";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";

// SVG flags (emoji flags render as letters on Windows).
const FLAGS: Record<Locale, typeof US> = { en: US, es: ES, pt: PT, fr: FR, de: DE, ru: RU };

function Flag({ code, className = "" }: { code: Locale; className?: string }) {
  const F = FLAGS[code];
  // Clipped by a wrapper: rounding an <svg> directly leaves light edge pixels.
  return (
    <span aria-hidden className={`inline-block shrink-0 overflow-hidden rounded-[5px] ${className}`}>
      {/* Scaled a touch past the clip so no light anti-aliased edge shows at the corners */}
      <F className="block size-full scale-[1.08]" preserveAspectRatio="xMidYMid slice" />
    </span>
  );
}

export function LanguageSelector({ compact = false, up = false }: { compact?: boolean; up?: boolean }) {
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
        className={`inline-flex h-10 items-center gap-2 rounded-lg text-sm ${up ? "border border-white/10 px-3" : "px-2.5"} text-soft transition-colors hover:bg-white/[0.06] hover:text-fg`}
      >
        <Flag key={selected.code} code={selected.code} className="lang-flag-in h-[18px] w-[27px]" />
        {!compact && <span>{selected.label}</span>}
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>
      {open && (
        <div className={`lang-panel-in absolute z-50 w-[min(21rem,calc(100vw-2rem))] ${up ? "bottom-full left-0 mb-2 origin-bottom-left" : "right-0 mt-2 origin-top-right"} rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)]`}>
          <p className="px-2 pb-2 pt-1 text-xs capitalize text-mute">{t("language")}</p>
          <ul role="listbox" aria-label={t("language")} className="grid grid-cols-2 gap-1">
            {LOCALES.map((item, i) => {
              const active = item.code === locale;
              return (
                <li key={item.code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale(item.code);
                      setOpen(false);
                    }}
                    style={{ animationDelay: `${i * 25}ms` }}
                    className={`lang-item-in flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.95rem] transition-all duration-200 active:scale-[0.97] ${
                      active ? "bg-brand/10 text-fg ring-1 ring-inset ring-brand/40" : "text-soft hover:bg-white/[0.05] hover:text-fg"
                    }`}
                  >
                    <Flag code={item.code} className="h-[24px] w-[36px]" />
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
