"use client";

import Link from "@/components/locale-link";
import { Copyright } from "lucide-react";
import { SITE } from "@/lib/site";
import { Logo } from "./logo";
import { LanguageSelector } from "./language-selector";
import { InstagramIcon, XIcon } from "./social-icons";
import { DiscordIcon } from "./discord-icon";
import { useI18n } from "@/lib/i18n";

const columns = [
  {
    title: "Product",
    links: [
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
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 pb-8 pt-10 sm:grid-cols-3 sm:gap-y-10 sm:py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 space-y-4 sm:col-span-3 md:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mute">
            {t("Advanced security and automation for Discord communities. Made by Stane.")}
          </p>
          <LanguageSelector up />
        </div>
        {columns.map((col) => (
          // On phones the legal links sit in one wrapped row so the footer stays short.
          <div key={col.title} className={col.title === "Legal" ? "col-span-2 sm:col-span-1" : undefined}>
            <h3 className="text-sm font-medium text-fg">{t(col.title)}</h3>
            <ul className={`mt-3 sm:mt-4 sm:block sm:space-y-2.5 ${col.title === "Legal" ? "grid grid-cols-2 gap-x-6 gap-y-2" : "space-y-2"}`}>
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="text-sm text-mute transition-colors hover:text-fg">
                      {t(l.label)}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-sm text-mute transition-colors hover:text-fg">
                      {t(l.label)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-3 px-5 py-5 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
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
              <a key={href} href={href} target="_blank" rel="noopener" aria-label={label} title={label} className="group inline-flex size-9 items-center justify-center rounded-lg text-mute transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-fg">
                {Icon === DiscordIcon ? <DiscordIcon className="size-[18px] transition-transform duration-200 group-hover:scale-110" color="#5865F2" /> : <Icon className="size-[18px] transition-transform duration-200 group-hover:scale-110" />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
