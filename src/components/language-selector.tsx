"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALES, useI18n } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = LOCALES.find((item) => item.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
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
        aria-label={t("language")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-normal text-soft transition-colors hover:bg-white/[0.06] hover:text-fg"
      >
        <Globe className="size-4" strokeWidth={1.75} />
        <span className="uppercase tracking-wide">{selected.code}</span>
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-[#0d1311] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
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
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-normal transition-colors ${
                    active ? "bg-brand/10 text-fg" : "text-soft hover:bg-white/[0.05] hover:text-fg"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 font-mono text-[11px] uppercase text-mute">{item.code}</span>
                    {item.label}
                  </span>
                  {active && <Check className="size-3.5 text-brand" strokeWidth={2} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
