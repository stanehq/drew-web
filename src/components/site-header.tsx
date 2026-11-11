"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./logo";
import { buttonClass } from "./button";
import { DiscordIcon } from "./discord-icon";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "border-b border-line bg-ink/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 rounded-full border border-line bg-white/[0.03] p-1 md:flex" aria-label="Main">
          {NAV.map((item) => {
            const active = item.href !== "/#features" && pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active ? "bg-white/[0.08] text-fg" : "text-mute hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a href={SITE.docs} className="rounded-full px-3.5 py-1.5 text-sm text-mute transition-colors hover:text-fg">
            Docs
          </a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/dashboard" className={buttonClass("ghost", "sm")}>
            Dashboard
          </Link>
          <a href={SITE.invite} className={buttonClass("primary", "sm")}>
            <DiscordIcon /> Add to Discord
          </a>
        </div>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full text-soft hover:bg-white/[0.06] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line px-4 pb-5 pt-3 md:hidden">
          <nav className="grid gap-1" aria-label="Mobile">
            {[...NAV, { href: SITE.docs, label: "Docs" }, { href: "/dashboard", label: "Dashboard" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-soft hover:bg-white/[0.05] hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <a href={SITE.invite} className={`${buttonClass("primary")} mt-3 w-full`}>
            <DiscordIcon /> Add to Discord
          </a>
        </div>
      )}
    </header>
  );
}
