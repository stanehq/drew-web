"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { buttonClass } from "./button";
import { DiscordIcon } from "./discord-icon";

const DASHBOARD_LOGIN = "/api/auth/discord";

function BrandLockup() {
  return (
    <div className="inline-flex shrink-0 items-center gap-3">
      <a href="https://stanelabs.com" target="_blank" rel="noreferrer" aria-label="StaneLabs" className="inline-flex size-12 items-center justify-center overflow-hidden rounded-lg bg-white">
        <Image src="/brand/stane-mark.webp" alt="Stane" width={48} height={48} priority className="size-12 object-cover" />
      </a>
      <span aria-hidden className="text-2xl font-light text-white/55">×</span>
      <Link href="/" aria-label="Drew home" className="inline-flex shrink-0 items-center">
        <Image src="/brand/drew-icon.svg" alt="Drew" width={43} height={43} priority />
      </Link>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [...NAV, { href: SITE.docs, label: "Docs" }];

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink text-fg shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div className="grid h-[82px] w-full grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <BrandLockup />
        <nav className="hidden h-full items-center justify-center gap-1 lg:flex" aria-label="Main">
          {links.map((item) => {
            const internal = item.href.startsWith("/");
            const route = item.href.split("#")[0];
            const active = internal && route.length > 1 && pathname === route;
            const cls = `relative inline-flex h-full items-center px-4 text-[0.98rem] font-semibold transition-colors hover:text-brand-bright after:absolute after:inset-x-4 after:bottom-0 after:h-[2px] after:bg-brand after:transition-transform ${active ? "text-brand-bright after:scale-x-100" : "text-soft after:scale-x-0"}`;
            return internal ? (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cls}>{item.label}</Link>
            ) : (
              <a key={item.href} href={item.href} className={cls}>{item.label}</a>
            );
          })}
        </nav>
        <div className="hidden shrink-0 items-center justify-self-end gap-3 lg:flex">
          <a href={DASHBOARD_LOGIN} className={buttonClass("outline", "md")}>
            <LayoutDashboard className="size-4" /> Dashboard
          </a>
          <a href={SITE.invite} className={buttonClass("primary", "md")}>
            <DiscordIcon /> Add to Discord
          </a>
        </div>
        <button
          type="button"
          className="col-start-3 inline-flex size-11 items-center justify-self-end border border-line text-soft transition-colors hover:border-brand/60 hover:bg-brand/10 hover:text-brand-bright lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-ink px-5 pb-6 pt-2 lg:hidden">
          <nav className="grid" aria-label="Mobile">
            {links.map((item) => item.href.startsWith("/") ? (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-line px-1 py-4 font-semibold text-soft hover:text-brand-bright">{item.label}</Link>
            ) : (
              <a key={item.href} href={item.href} className="border-b border-line px-1 py-4 font-semibold text-soft hover:text-brand-bright">{item.label}</a>
            ))}
          </nav>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a href={DASHBOARD_LOGIN} className={`${buttonClass("outline", "lg")} w-full`}><LayoutDashboard className="size-4" /> Dashboard</a>
            <a href={SITE.invite} className={`${buttonClass("primary", "lg")} w-full`}><DiscordIcon /> Add to Discord</a>
          </div>
        </div>
      )}
    </header>
  );
}
