"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Crown, ExternalLink, Menu, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { DiscordIcon } from "./discord-icon";
import { LanguageSelector } from "./language-selector";
import { useI18n, type Locale } from "@/lib/i18n";

const LOGIN = "/api/auth/discord";

// Header copy with its translations (falls back to English).
const COPY: Record<string, Partial<Record<Locale, string>>> = {
  "Log in": { es: "Iniciar sesión", pt: "Iniciar sessão", fr: "Se connecter", de: "Anmelden", ru: "Войти" },
  "Get Premium": { es: "Conseguir Premium", pt: "Obter Premium", fr: "Obtenir Premium", de: "Premium holen", ru: "Получить Premium" },
  "Add to Discord": { es: "Añadir a Discord", pt: "Adicionar ao Discord", fr: "Ajouter à Discord", de: "Zu Discord hinzufügen", ru: "Добавить в Discord" },
  "Stane products": { es: "Productos de Stane", pt: "Produtos Stane", fr: "Produits Stane", de: "Stane-Produkte", ru: "Продукты Stane" },
};

type Item = { label: string; href: string; hint?: string; keywords?: string };

const MORE: Item[] = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Status", href: "/status" },
  { label: "Metrics", href: "/metrics" },
  { label: "API", href: "/developers" },
  { label: "Docs", href: SITE.docs },
  { label: "Support", href: SITE.support },
];


const isExternal = (href: string) => /^https?:\/\//.test(href);

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function MenuLink({ item, onPick, label }: { item: Item; onPick: () => void; label: string }) {
  const cls = "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-soft transition-colors hover:bg-white/[0.06] hover:text-fg";
  const body = (
    <>
      <span>{label}</span>
      {item.hint ? <span className="font-mono text-[10px] uppercase tracking-wider text-mute">{item.hint}</span> : isExternal(item.href) ? <ExternalLink className="size-3.5 text-mute" /> : null}
    </>
  );
  return isExternal(item.href) || item.href.startsWith("/api/") ? (
    <a href={item.href} onClick={onPick} className={cls}>{body}</a>
  ) : (
    <Link href={item.href} onClick={onPick} className={cls}>{body}</Link>
  );
}

function Dropdown({ label, children, className = "" }: { label: React.ReactNode; children: (close: () => void) => React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useOutside(open, close);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={className}>
        {label}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-[#0d1311] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          {children(close)}
        </div>
      )}
    </div>
  );
}


export function SiteHeader() {
  const { t, locale } = useI18n();
  const tr = (k: string) => COPY[k]?.[locale] ?? k;
  const label = (k: string) => {
    const v = t(k.toLowerCase());
    return v === k.toLowerCase() ? k : v;
  };
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => window.innerWidth >= 1280 && setOpen(false);
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-[#101113] text-fg">
      <div className="flex h-[76px] w-full items-center gap-5 px-4 sm:px-6 xl:gap-6 lg:px-8">
        {/* Stane mark with a products menu, then the Drew wordmark */}
        <Dropdown
          className="inline-flex items-center gap-1.5 text-soft hover:text-fg"
          label={
            <span className="inline-flex size-10 items-center justify-center overflow-hidden rounded-md bg-white">
              <Image src="/brand/stane-mark.webp" alt="Stane" width={40} height={40} priority className="size-10 object-cover" />
            </span>
          }
        >
          {(close) => (
            <>
              <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-mute">{tr("Stane products")}</p>
              <MenuLink item={{ label: "StaneLabs", href: "https://stanelabs.com" }} label="StaneLabs" onPick={close} />
              <MenuLink item={{ label: "Drew", href: "/" }} label="Drew" onPick={close} />
            </>
          )}
        </Dropdown>
        <Link href="/" aria-label="Drew home" className="inline-flex shrink-0 items-center gap-2">
          <Image src="/brand/drew-icon.svg" unoptimized alt="" width={34} height={34} priority />
          <span className="font-display text-[1.45rem] font-bold uppercase tracking-tight">Drew</span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label={t("Main")}>
          {MORE.map((item) =>
            isExternal(item.href) ? (
              <a key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-2.5 py-2 text-[1rem] font-medium text-fg/85 transition-colors hover:bg-white/[0.06] hover:text-fg">
                {label(item.label)}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-2.5 py-2 text-[1rem] font-medium text-fg/85 transition-colors hover:bg-white/[0.06] hover:text-fg">
                {label(item.label)}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-2.5 xl:flex">
          <LanguageSelector compact />
          <a href={LOGIN} className="inline-flex h-11 items-center whitespace-nowrap rounded-lg bg-[#2a2b2f] px-4 text-[0.95rem] font-semibold text-fg transition-colors hover:bg-[#35363b]">
            {tr("Log in")}
          </a>
          <Link href="/pricing" className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-brand-deep px-4 text-[0.95rem] font-semibold text-white transition-colors hover:bg-[#238a5c]">
            <Crown className="size-4" /> {tr("Get Premium")}
          </Link>
          <a href={SITE.invite} className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-brand px-4 text-[0.95rem] font-semibold text-[#03110a] transition-colors hover:bg-brand-bright">
            {tr("Add to Discord")} <DiscordIcon />
          </a>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-lg text-soft hover:bg-white/[0.06] xl:hidden"
          aria-label={open ? t("Close menu") : t("Open menu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-[#101113] px-4 pb-6 pt-4 xl:hidden">
          <nav className="grid" aria-label={t("Mobile")}>
            {MORE.map((item) => (
              <MenuLink key={item.href} item={item} label={label(item.label)} onPick={() => setOpen(false)} />
            ))}
          </nav>
          <div className="mt-4 grid gap-2.5">
            <a href={LOGIN} className="inline-flex h-12 items-center justify-center rounded-lg bg-[#2a2b2f] font-semibold">{tr("Log in")}</a>
            <Link href="/pricing" onClick={() => setOpen(false)} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-deep font-semibold text-white">
              <Crown className="size-4" /> {tr("Get Premium")}
            </Link>
            <a href={SITE.invite} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand font-semibold text-[#03110a]">
              {tr("Add to Discord")} <DiscordIcon />
            </a>
            <div className="flex justify-center">
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
