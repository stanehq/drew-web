"use client";

import Image from "next/image";
import Link from "@/components/locale-link";
import { useEffect, useState } from "react";
import { ExternalLink, LayoutDashboard, Menu, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { DiscordIcon } from "./discord-icon";
import { LanguageSelector } from "./language-selector";
import { useI18n } from "@/lib/i18n";
import { localizePath, type LocaleCode } from "@/lib/locales";

const LOGIN = "/api/auth/discord";

const DASHBOARD_BTN =
  "inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-white bg-white px-4 text-[0.95rem] font-semibold text-[#07110c] transition-colors hover:border-white/85 hover:bg-white/90";

type Item = { label: string; href: string };

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


function MenuLink({ item, onPick, label, locale }: { item: Item; onPick: () => void; label: string; locale: LocaleCode }) {
  const cls = "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-soft transition-colors hover:bg-white/[0.06] hover:text-fg";
  const body = (
    <>
      <span>{label}</span>
      {isExternal(item.href) && <ExternalLink className="size-3.5 text-mute" />}
    </>
  );
  if (item.href.startsWith("/#")) {
    return <a href={localizePath(item.href, locale)} onClick={onPick} className={cls}>{body}</a>;
  }
  return isExternal(item.href) || item.href.startsWith("/api/") ? (
    <a href={item.href} onClick={onPick} className={cls}>{body}</a>
  ) : (
    <Link href={item.href} onClick={onPick} className={cls}>{body}</Link>
  );
}



export function SiteHeader() {
  const { t, locale } = useI18n();
  const label = (k: string) => t(k);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => window.innerWidth >= 1280 && setOpen(false);
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-black text-fg">
      <div className="flex h-[76px] w-full items-center gap-5 px-4 sm:px-6 xl:gap-6 lg:px-8">
        <div className="inline-flex shrink-0 items-center gap-3">
          <a href={SITE.stane.web} target="_blank" rel="noopener" aria-label="Stane Labs" className="transition-opacity hover:opacity-85">
            <Image src="/brand/stane-mark.webp" alt="Stane" width={48} height={48} priority className="size-12 rounded-xl object-cover" />
          </a>
          <span aria-hidden className="text-2xl font-light text-white/55">×</span>
          <Link href="/" aria-label="Drew home" className="inline-flex items-center gap-2">
            <Image src="/brand/drew-icon.svg" unoptimized alt="" width={39} height={39} priority />
            <span className="font-display text-[1.35rem] font-semibold tracking-[-0.03em] drew-wordmark">Drew</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label={t("Main")}>
          {MORE.map((item) =>
            item.href.startsWith("/#") ? (
              <a key={item.href} href={localizePath(item.href, locale)} className="whitespace-nowrap rounded-lg px-2.5 py-2 text-[1rem] font-medium text-fg/85 transition-colors hover:bg-white/[0.06] hover:text-fg">
                {label(item.label)}
              </a>
            ) : isExternal(item.href) ? (
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
          <a href={LOGIN} className={DASHBOARD_BTN}>
            <LayoutDashboard className="size-4" /> {label("Dashboard")}
          </a>
          <a href={SITE.invite} className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-[#7ee8b5] bg-[linear-gradient(110deg,#35c98d_0%,#41cf8b_58%,#7ee8b5_100%)] px-4 text-[0.95rem] font-semibold text-white transition-all hover:bg-[linear-gradient(110deg,#41cf8b_0%,#65dda9_58%,#a5f3cf_100%)]">
            {t("Add to Discord")} <DiscordIcon />
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
        <div className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-white/[0.08] bg-black px-4 pb-6 pt-4 xl:hidden">
          <nav className="grid" aria-label={t("Mobile")}>
            {MORE.map((item) => (
              <MenuLink key={item.href} item={item} label={label(item.label)} locale={locale} onPick={() => setOpen(false)} />
            ))}
          </nav>
          <div className="mt-4 grid gap-2.5">
            <a href={LOGIN} className={`${DASHBOARD_BTN} h-12 justify-center`}>
              <LayoutDashboard className="size-4" /> {label("Dashboard")}
            </a>
            <a href={SITE.invite} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#7ee8b5] bg-[linear-gradient(110deg,#35c98d_0%,#41cf8b_58%,#7ee8b5_100%)] font-semibold text-white">
              {t("Add to Discord")} <DiscordIcon />
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
