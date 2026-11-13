"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Braces, DatabaseBackup, FileClock, KeyRound, LayoutDashboard, PlusCircle, ScrollText, ShieldAlert, UserCheck, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { DiscordIcon } from "@/components/discord-icon";
import { LiveStats } from "@/components/live-stats";
import { ServerShowcase } from "@/components/server-showcase";
import { SITE } from "@/lib/site";

// Two highlighted protections, then the rest in a quieter grid (GitHub-style).
const highlights = [
  {
    icon: ShieldAlert,
    title: "Anti-nuke",
    body: "Watches the audit log in real time and punishes anyone mass-deleting channels or roles, before the damage spreads.",
  },
  { icon: Users, title: "Anti-raid", body: "Detects join floods and stops them with the punishment you choose." },
];

const features = [
  { icon: UserCheck, title: "Verification", body: "A one-click panel that gives members their role once verified." },
  { icon: ScrollText, title: "Logging", body: "Messages, members, roles, channels and voice, logged where you want without spam." },
  {
    icon: KeyRound,
    title: "SUDO mode",
    body: "Sensitive changes require the owner's password, so a compromised admin can't switch your protection off.",
  },
  { icon: DatabaseBackup, title: "Backups", body: "Snapshot your security setup and restore it in seconds." },
  { icon: FileClock, title: "Audit trail", body: "Every configuration change is recorded and announced in your log channel." },
  { icon: Braces, title: "Configuration API", body: "Prefer code? Every setting is also available through a scoped, audited API.", href: "/developers" },
];

const steps = [
  { n: "1", title: "Invite Drew", body: "Add the bot to your server with one click." },
  { n: "2", title: "Run /opsec setup", body: "Pick a log channel and the protections you want." },
  { n: "3", title: "Relax", body: "Drew watches every change, 24/7, and reacts in milliseconds." },
];

const primary =
  "inline-flex h-12 items-center gap-2 rounded-md bg-brand px-6 text-[0.98rem] font-semibold text-[#03110a] transition-colors hover:bg-brand-bright";
const secondary =
  "inline-flex h-12 items-center gap-2 rounded-md border border-white/15 px-6 text-[0.98rem] font-semibold text-fg transition-colors hover:border-white/30 hover:bg-white/[0.04]";

function SectionTitle({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-medium text-brand-bright">{kicker}</p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">{title}</h2>
      {children && <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-soft">{children}</p>}
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  return (
    <>
      {/* Hero: centered, one soft glow, nothing else in the background */}
      <section className="relative isolate overflow-hidden pt-[76px]">
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-[520px] bg-[radial-gradient(60%_70%_at_50%_100%,rgb(65_207_139/0.16),transparent_70%)]"
          aria-hidden
        />
        <div className="mx-auto max-w-4xl px-5 pb-24 pt-24 text-center sm:pt-32">
          <Link
            href="/developers"
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 text-sm text-soft transition-colors hover:border-white/20 hover:text-fg"
          >
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand-bright">{t("New")}</span>
            {t("Configuration API")}
            <ArrowRight className="size-3.5" />
          </Link>
          <h1 className="animate-fade-up mt-8 text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-7xl">
            {t("Discord security ")}
            <span className="text-brand">{t("that never sleeps")}</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-soft sm:text-xl [animation-delay:80ms]">
            {t("Anti-nuke, anti-raid, verification and logging in one bot. Set it up in a minute and let Drew do the watching")}
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:140ms]">
            <a href={SITE.invite} className={primary}>
              <DiscordIcon /> {t("Add to Discord")}
            </a>
            <a href="/api/auth/discord" className={secondary}>
              <LayoutDashboard className="size-4" /> {t("Open dashboard")}
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-16">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f0d]/80 backdrop-blur">
            <LiveStats />
          </div>
        </div>
      </section>

      <ServerShowcase />

      {/* Features */}
      <section id="features" className="scroll-mt-24 px-5 py-28">
        <SectionTitle kicker={t("Protection")} title={t("Everything your server needs to stay standing")}>
          {t("Set it up in minutes, Drew does the watching 24/7")}
        </SectionTitle>
        <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-2">
          {highlights.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="surface relative overflow-hidden p-8 sm:p-10"
            >
              <Icon className="size-7 text-brand" strokeWidth={1.75} />
              <h3 className="mt-8 text-2xl font-semibold tracking-tight">{t(title)}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-soft">{t(body)}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-4 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body, href }) => {
            const inner = (
              <>
                <Icon className="size-5 text-brand" strokeWidth={1.75} />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{t(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{t(body)}</p>
                {href && (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-bright">
                    {t("Read more")} <ArrowRight className="size-3.5" />
                  </span>
                )}
              </>
            );
            const cls = "block rounded-2xl border border-white/10 p-7 transition-colors hover:border-white/20 hover:bg-white/[0.02]";
            return href ? (
              <Link key={title} href={href} className={cls}>
                {inner}
              </Link>
            ) : (
              <article key={title} className={cls}>
                {inner}
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 pb-28">
        <SectionTitle kicker={t("Get started")} title={t("Protect your server in under a minute")} />
        <ol className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="text-center md:text-left">
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-brand-bright">
                {s.n}
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{t(s.title)}</h3>
              <p className="mt-2 text-soft">{t(s.body)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA card, Wick/Kena style: centered, vivid multi-color gradient, joined buttons */}
      <section className="relative px-5 pb-28">
        <div className="surface relative mx-auto max-w-4xl overflow-hidden px-6 py-16 text-center sm:px-12 sm:py-20">
          <Image src="/brand/drew-icon.svg" unoptimized alt="" width={56} height={56} className="mx-auto" />
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">{t("Protect your server in under a minute")}</h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-soft">{t("Invite Drew, run /opsec setup and sleep well tonight")}</p>
          <div className="mx-auto mt-10 inline-flex overflow-hidden rounded-xl border border-white/15 text-fg">
            <a href={SITE.invite} className="inline-flex h-14 items-center gap-2.5 px-6 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white/[0.06] sm:px-8">
              <PlusCircle className="size-5" strokeWidth={1.75} /> {t("Invite")}
            </a>
            <span className="w-px bg-white/15" aria-hidden />
            <a href="/api/auth/discord" className="inline-flex h-14 items-center gap-2.5 px-6 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white/[0.06] sm:px-8">
              <LayoutDashboard className="size-5" strokeWidth={1.75} /> {t("Dashboard")}
            </a>
          </div>
          <p className="mt-6 text-sm text-mute">
            <a href={SITE.support} className="underline decoration-white/30 underline-offset-4 hover:text-fg hover:decoration-white">
              {t("Join support")}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
