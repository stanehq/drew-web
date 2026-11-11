"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  DatabaseBackup,
  FileClock,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/button";
import { CommandField } from "@/components/command-field";
import { DiscordIcon } from "@/components/discord-icon";
import { LiveStats } from "@/components/live-stats";
import { ServerShowcase } from "@/components/server-showcase";
import { ReputationLinks } from "@/components/reputation-links";
import { SITE } from "@/lib/site";

const features = [
  {
    icon: ShieldAlert,
    title: "Anti-nuke",
    body: "Watches the audit log in real time and punishes anyone mass-deleting channels or roles, before the damage spreads.",
  },
  { icon: Users, title: "Anti-raid", body: "Detects join floods and stops them with the punishment you choose." },
  { icon: UserCheck, title: "Verification", body: "A one-click panel that gives members their role once verified." },
  { icon: ScrollText, title: "Logging", body: "Messages, members, roles, channels and voice, logged where you want without spam." },
  {
    icon: KeyRound,
    title: "SUDO mode",
    body: "Sensitive changes require the owner's password, so a compromised admin can't switch your protection off.",
  },
  { icon: DatabaseBackup, title: "Backups", body: "Snapshot your security setup and restore it in seconds." },
  { icon: FileClock, title: "Audit trail", body: "Every configuration change is recorded and announced in your log channel." },
  {
    icon: Braces,
    title: "Configuration API",
    body: "Prefer code? Every setting is also available through a scoped, audited API.",
    href: "/developers",
  },
];

const steps = [
  { n: "01", title: "Invite Drew", body: "Add the bot to your server with one click." },
  { n: "02", title: "Run /opsec setup", body: "Pick a log channel and the protections you want." },
  { n: "03", title: "Relax", body: "Drew watches every change, 24/7, and reacts in milliseconds." },
];

export default function HomePage() {
  const { t } = useI18n();
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-line pt-[76px]">
        <CommandField className="-z-10" />
        <div
          className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(65_207_139/0.18),transparent)] blur-2xl"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl border-x border-line px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <Image src="/brand/drew-icon.svg" unoptimized alt="" width={88} height={88} priority className="animate-fade-up mx-auto" />
          <h1 className="animate-fade-up mx-auto mt-8 max-w-4xl text-balance text-[2.3rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            {t("Discord security ")}<span className="text-brand">{t("that never sleeps")}</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-soft [animation-delay:80ms]">
            {t("Anti-nuke, anti-raid, verification and logging in one bot. Set it up in a minute and let Drew do the watching")}
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:140ms]">
            <ButtonLink href={SITE.invite} external size="lg">
              <DiscordIcon /> {t("Add to Discord")}
            </ButtonLink>
            <ButtonLink href="/api/auth/discord" variant="outline" size="lg">
              <LayoutDashboard className="size-4" /> {t("Open dashboard")}
            </ButtonLink>
          </div>
        </div>
        <div className="mx-auto max-w-6xl border-x border-t border-line">
          <LiveStats />
        </div>
      </section>

      <ReputationLinks />
      <ServerShowcase />

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto max-w-6xl border-x border-line">
          <div className="grid gap-6 px-4 py-16 sm:px-8 md:grid-cols-2 md:items-end">
            <div>
              <h2 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
                {t("Everything your server needs to stay standing")}
              </h2>
            </div>
            <p className="text-lg text-soft md:justify-self-end md:text-right">{t("Set it up in minutes, Drew does the watching 24/7")}</p>
          </div>
          <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body, href }) => {
              const inner = (
                <>
                  <Icon className="size-5 text-brand" />
                  <h3 className="mt-6 text-[1.05rem] font-semibold tracking-tight">{t(title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{t(body)}</p>
                  {href && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-bright">
                      {t("Read more")} <ArrowRight className="size-3.5" />
                    </span>
                  )}
                </>
              );
              const cls = "block bg-ink p-7 transition-colors hover:bg-night";
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
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-px border-x border-line bg-line md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-ink p-8 sm:p-10">
              <p className="font-mono text-sm text-brand">{s.n}</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">{t(s.title)}</h3>
              <p className="mt-2 text-soft">{t(s.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-line">
        <div className="relative w-full overflow-hidden border-y border-line bg-brand bg-no-repeat bg-origin-border md:bg-[linear-gradient(110deg,#41cf8b_0%,#2fae72_38%,#0e2a1d_78%,#07100c_100%)]">
          <div className="dot-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(90deg,transparent,black)]" aria-hidden />
          <Image
            src="/brand/drew-icon.svg"
            unoptimized
            alt=""
            width={340}
            height={340}
            className="pointer-events-none absolute -bottom-20 right-[-40px] opacity-25 sm:right-10 sm:opacity-40"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
              {t("Protect your server in under a minute")}
            </h2>
            <p className="mt-4 text-lg text-white/90">{t("Invite Drew, run /opsec setup and sleep well tonight")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={SITE.invite}
                className="inline-flex h-12 items-center gap-2 rounded-md border border-[#03110a] bg-[#03110a] px-6 text-[0.98rem] font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                <DiscordIcon /> Add to Discord
              </a>
              <a
                href={SITE.support}
                className="inline-flex h-12 items-center gap-2 rounded-md border border-white bg-white px-6 text-[0.98rem] font-semibold text-[#03110a] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white/90"
              >
                Join support
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
