import Link from "next/link";
import { Copyright } from "lucide-react";
import { SITE } from "@/lib/site";
import { Logo } from "./logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
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
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mute">
            Advanced security and automation for Discord communities. Made by Stane.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-medium text-fg">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="text-sm text-mute transition-colors hover:text-brand">
                      {l.label}
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
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-mute sm:px-6"><Copyright className="mr-1 inline size-3 align-[-1px]" aria-label="Copyright" />{new Date().getFullYear()} Drew. All rights reserved.</p>
      </div>
    </footer>
  );
}
