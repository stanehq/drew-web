"use client";

import Image from "next/image";
import { preload } from "react-dom";
import Link from "@/components/locale-link";
import { ArrowRight, Braces, DatabaseBackup, FileClock, KeyRound, LayoutDashboard, PlusCircle, ScrollText, ShieldAlert, UserCheck, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { DiscordIcon } from "@/components/discord-icon";
import { LiveStats } from "@/components/live-stats";
import { ServerShowcase } from "@/components/server-showcase";
import { SITE } from "@/lib/site";
import { HeroAtmosphere } from "@/components/hero-atmosphere";
import { TwoTone } from "@/components/two-tone";

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
  "inline-flex h-12 items-center gap-2 rounded-md bg-brand px-6 text-[0.98rem] font-semibold text-white transition-colors hover:bg-brand-bright";
const secondary =
  "inline-flex h-12 items-center gap-2 rounded-md border border-white/15 px-6 text-[0.98rem] font-semibold text-fg transition-colors hover:border-white/30 hover:bg-white/[0.04]";

function SectionTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-balance text-4xl font-semibold tracking-[-0.025em] sm:text-6xl"><TwoTone text={title} /></h2>
      {children && <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-soft">{children}</p>}
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  // Start the live data requests with the HTML instead of after hydration.
  if (typeof window === "undefined") {
    preload("/api/stats", { as: "fetch", crossOrigin: "anonymous" });
    preload("/api/showcase", { as: "fetch", crossOrigin: "anonymous" });
  }
  return (
    <>
      <svg aria-hidden="true" className="pointer-events-none absolute size-0 overflow-hidden">
        <defs>
          <linearGradient id="drew-icon-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#35c98d" />
            <stop offset="52%" stopColor="#7ee8b5" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
      {/* Hero: centered, one soft glow, nothing else in the background */}
      <section className="relative isolate overflow-hidden pt-[76px]">
        <HeroAtmosphere />
        {/* Soft glow behind the stats, fully faded before any edge so no seam shows */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[38%] -z-10 h-[560px] bg-[radial-gradient(45%_50%_at_50%_50%,rgb(65_207_139/0.13),transparent_100%)]"
          aria-hidden
        />
        <div className="mx-auto max-w-4xl px-5 pb-24 pt-8 text-center sm:pt-12">
          <h1 className="animate-fade-up mx-auto max-w-[14ch] text-balance text-[clamp(2.4rem,7.2vw,7rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
            <TwoTone text={`${t("Discord security")} ${t("that never sleeps")}`} greenWords={2} />
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl px-2 text-pretty text-[clamp(1rem,1.5vw,1.3rem)] leading-relaxed text-white [animation-delay:80ms]">
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
        <div className="mx-auto max-w-5xl px-5 pb-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f0d]/80 backdrop-blur">
            <LiveStats />
          </div>
        </div>
        <ServerShowcase />
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 px-5 py-28">
        <SectionTitle title={t("Everything your server needs to stay standing")}>
          {t("Set it up in minutes, Drew does the watching 24/7")}
        </SectionTitle>
        <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-2">
          {highlights.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="surface relative overflow-hidden p-8 sm:p-10"
            >
              <Icon className="drew-icon-gradient size-7" strokeWidth={1.75} />
              <h3 className="mt-8 text-2xl font-semibold tracking-tight text-white">{t(title)}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-soft">{t(body)}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-4 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body, href }) => {
            const inner = (
              <>
                <Icon className="drew-icon-gradient size-5" strokeWidth={1.75} />
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{t(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{t(body)}</p>
                {href && (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg">
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
        <SectionTitle title={t("Up and running in three steps")} />
        <ol className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="text-center md:text-left">
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-soft">
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
        <div className="cta-gradient relative mx-auto max-w-4xl overflow-hidden rounded-2xl px-6 py-16 text-center shadow-[0_40px_100px_-40px_rgba(65,207,139,0.7)] sm:px-12 sm:py-20">
          <Image
            src="/brand/drew-icon.svg"
            unoptimized
            alt=""
            aria-hidden
            width={340}
            height={340}
            className="pointer-events-none absolute -right-16 top-1/2 size-[240px] -translate-y-1/2 rotate-[-8deg] opacity-30 brightness-0 invert [mask-image:linear-gradient(90deg,transparent,black_55%)] sm:-right-10 sm:size-[380px] sm:opacity-40"
          />
          <h2 className="relative text-balance text-4xl font-semibold tracking-[-0.025em] text-white sm:text-6xl">{t("Protect your server in under a minute")}</h2>
          <p className="relative mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/90">{t("Invite Drew, run /opsec setup and sleep well tonight")}</p>
          <div className="relative mx-auto mt-10 inline-flex overflow-hidden rounded-xl border border-white/70 text-white">
            <a href={SITE.invite} className="inline-flex h-14 items-center gap-2.5 px-6 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white/15 sm:px-8">
              <PlusCircle className="size-5" strokeWidth={1.75} /> {t("Invite")}
            </a>
            <span className="w-px bg-white/70" aria-hidden />
            <a href="/api/auth/discord" className="inline-flex h-14 items-center gap-2.5 px-6 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white/15 sm:px-8">
              <LayoutDashboard className="size-5" strokeWidth={1.75} /> {t("Dashboard")}
            </a>
          </div>
          <p className="relative mt-6 text-sm text-white/85">
            <a href={SITE.support} className="underline decoration-white/50 underline-offset-4 hover:decoration-white">
              {t("Join support")}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
