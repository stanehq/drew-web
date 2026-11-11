"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./logo";
import { buttonClass } from "./button";
import { DiscordIcon } from "./discord-icon";

const DASHBOARD_LOGIN = "/api/auth/discord";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = [...NAV, { href: SITE.docs, label: "Docs" }];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/95 text-fg shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-300 ${scrolled ? "bg-ink/95" : "bg-ink/90"}`}>
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-8 xl:gap-12">
          <Link href="/" aria-label="Drew home" className="shrink-0">
            <Logo size={40} />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map((item) => {
              const internal = item.href.startsWith("/");
              const route = item.href.split("#")[0];
              const active = internal && route.length > 1 && pathname === route;
              const cls = `relative inline-flex h-[82px] items-center px-4 text-[0.96rem] font-semibold tracking-[-0.01em] transition-colors after:absolute after:inset-x-4 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-brand after:transition-transform hover:text-brand-bright hover:after:scale-x-100 ${active ? "text-brand-bright after:scale-x-100" : "text-soft"}`;
              return internal ? (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cls}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className={cls}>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <a href={DASHBOARD_LOGIN} className={buttonClass("outline", "md")}>
            <LayoutDashboard className="size-4" /> Dashboard
          </a>
          <a href={SITE.invite} className={buttonClass("primary", "md")}>
            <DiscordIcon /> Add to Discord
          </a>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center border border-line text-soft transition-colors hover:border-brand/60 hover:bg-brand/10 hover:text-brand-bright lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-ink px-4 pb-6 pt-2 lg:hidden">
          <nav className="mx-auto grid max-w-7xl" aria-label="Mobile">
            {links.map((item) =>
              item.href.startsWith("/") ? (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-line px-1 py-4 text-base font-semibold text-soft transition-colors hover:text-brand-bright">
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className="border-b border-line px-1 py-4 text-base font-semibold text-soft transition-colors hover:text-brand-bright">
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="mx-auto mt-5 grid max-w-7xl gap-3 sm:grid-cols-2">
            <a href={DASHBOARD_LOGIN} className={`${buttonClass("outline", "lg")} w-full`}>
              <LayoutDashboard className="size-4" /> Dashboard
            </a>
            <a href={SITE.invite} className={`${buttonClass("primary", "lg")} w-full`}>
              <DiscordIcon /> Add to Discord
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
