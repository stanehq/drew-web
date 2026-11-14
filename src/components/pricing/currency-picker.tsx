"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { AU, BR, CA, EU, GB, MX, US } from "country-flag-icons/react/3x2";
import { CURRENCY_CODES, CURRENCY_NAMES, type CurrencyCode } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { useSlidingHighlight } from "@/components/sliding-highlight";

const FLAGS: Record<CurrencyCode, typeof US> = { USD: US, EUR: EU, GBP: GB, BRL: BR, MXN: MX, CAD: CA, AUD: AU };

function Flag({ code, className = "" }: { code: CurrencyCode; className?: string }) {
  const F = FLAGS[code];
  return (
    <span aria-hidden className={`inline-block shrink-0 overflow-hidden rounded-[4px] ${className}`}>
      <F className="block size-full scale-[1.08]" preserveAspectRatio="xMidYMid slice" />
    </span>
  );
}

/** Currency dropdown in the same style as the language picker. */
export function CurrencyPicker({ value, onChange }: { value: CurrencyCode; onChange: (c: CurrencyCode) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const slide = useSlidingHighlight<CurrencyCode>(value, open);

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
        aria-label={`${t("Currency")}: ${value}`}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[46px] items-center gap-2.5 rounded-xl border border-white/10 px-3.5 text-sm font-medium text-fg transition-colors hover:border-white/20 hover:bg-white/[0.04]"
      >
        <Flag key={value} code={value} className="lang-flag-in h-[15px] w-[22px]" />
        {value}
        <ChevronDown className={`size-4 text-mute transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="lang-panel-in absolute right-0 z-50 mt-2 w-[min(17rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-white/10 bg-[#0a0a0a] p-1.5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <ul role="listbox" aria-label={t("Currency")} className="relative grid gap-0.5" {...slide.containerProps}>
            {slide.highlight("bg-white/[0.08]")}
            {CURRENCY_CODES.map((c, i) => {
              const active = c === value;
              return (
                <li key={c} role="option" aria-selected={active}>
                  <button
                    type="button"
                    {...slide.itemProps(c)}
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    style={{ animationDelay: `${i * 22}ms` }}
                    className={`lang-item-in relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active ? "text-fg" : "text-soft hover:text-fg"
                    }`}
                  >
                    <Flag code={c} className="h-[18px] w-[27px]" />
                    <span className="w-10 font-semibold text-fg">{c}</span>
                    <span className="flex-1 truncate text-mute">{t(CURRENCY_NAMES[c])}</span>
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
