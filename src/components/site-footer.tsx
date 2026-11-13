"use client";

import Link from "@/components/locale-link";
import { Copyright } from "lucide-react";
import { SITE } from "@/lib/site";
import { Logo } from "./logo";
import { LanguageSelector } from "./language-selector";
import { DiscordIcon } from "./discord-icon";
import { InstagramIcon, XIcon } from "./social-icons";
import { useI18n } from "@/lib/i18n";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/commands", label: "Commands" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
      { href: SITE.invite, label: "Invite" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/status", label: "Status" },
      { href: "/metrics", label: "Metrics" },
      { href: "/developers", label: "API" },
      { href: SITE.docs, label: "Docs" },
      { href: SITE.support, label: "Support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: SITE.terms, label: "Terms of Service" },
      { href: SITE.privacy, label: "Privacy Policy" },
      { href: SITE.purchaseTerms, label: "Purchase Terms" },
      { href: SITE.userAgreement, label: "User Agreement" },
    ],
  },
];

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mute">
            {t("Advanced security and automation for Discord communities. Made by Stane.")}
          </p>
          <LanguageSelector up />
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-medium text-fg">{t(col.title)}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="text-sm text-mute transition-colors hover:text-brand">
                      {t(l.label)}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-sm text-mute transition-colors hover:text-brand">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="md:col-span-4">
          <div className="border-t border-line pt-7">
            <h3 className="text-sm font-semibold text-white">{t("Platforms & support")}</h3>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4 text-white/55">
              <span className="text-lg font-bold tracking-tight">Patreon</span>
              <span className="text-lg font-semibold tracking-[-0.04em]">Lemon<span className="text-white/80">Squeezy</span></span>
              <span className="text-base font-semibold">Apple App Store</span>
              <span className="text-base font-semibold">Google Play</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="text-xs text-mute">
            <Copyright className="mr-1 inline size-3 align-[-1px]" aria-label="Copyright" />
            {new Date().getFullYear()} Drew {t("by")}{" "}
            <a href={SITE.stane.web} target="_blank" rel="noopener" className="text-soft hover:text-fg">Stane</a>. {t("All rights reserved.")}
          </p>
          <div className="flex items-center gap-1" aria-label={t("Stane on social media")}>
            {[
              { href: SITE.stane.x, label: "Stane on X", Icon: XIcon },
              { href: SITE.stane.discord, label: "Stane on Discord", Icon: DiscordIcon },
              { href: SITE.stane.instagram, label: "Stane on Instagram", Icon: InstagramIcon },
            ].map(({ href, label, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener" aria-label={label} title={label} className="inline-flex size-9 items-center justify-center rounded-lg text-mute transition-colors hover:bg-white/[0.06] hover:text-fg">
                <Icon className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
