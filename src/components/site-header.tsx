"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./logo";
import { buttonClass } from "./button";
import { DiscordIcon } from "./discord-icon";

// Goes straight to Discord OAuth. Already signed in users are sent on to /dashboard.
const DASHBOARD_LOGIN = "/api/auth/discord";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [...NAV, { href: SITE.docs, label: "Docs" }];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open ? "border-line bg-ink/80 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Logo size={36} />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map((item) => {
              const internal = item.href.startsWith("/");
              const active = internal && item.href !== "/#features" && pathname.startsWith(item.href);
              const cls = `px-3.5 py-2 text-[0.95rem] font-medium transition-colors ${active ? "text-fg" : "text-soft hover:text-fg"}`;
              return internal ? (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cls}>
                  {item.label}
                  {active && <span className="mt-1 block h-px bg-brand" aria-hidden />}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className={cls}>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={DASHBOARD_LOGIN} className={buttonClass("outline", "md")}>
            <LayoutDashboard className="size-4" /> Dashboard
          </a>
          <a href={SITE.invite} className={buttonClass("primary", "md")}>
            <DiscordIcon /> Add to Discord
          </a>
        </div>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center text-soft ring-1 ring-inset ring-line hover:bg-white/[0.06] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line px-4 pb-6 pt-2 lg:hidden">
          <nav className="grid" aria-label="Mobile">
            {links.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-line px-1 py-3.5 text-[1.05rem] font-medium text-soft hover:text-fg"
                >
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className="border-b border-line px-1 py-3.5 text-[1.05rem] font-medium text-soft hover:text-fg">
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="mt-5 grid gap-3">
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
