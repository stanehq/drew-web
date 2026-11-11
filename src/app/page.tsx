import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  DatabaseBackup,
  FileClock,
  KeyRound,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Aurora } from "@/components/aurora";
import { ButtonLink } from "@/components/button";
import { CommandField } from "@/components/command-field";
import { DiscordIcon } from "@/components/discord-icon";
import { LiveStats } from "@/components/live-stats";
import { SITE } from "@/lib/site";

const features = [
  {
    icon: ShieldAlert,
    title: "Anti-nuke",
    body: "Watches the audit log in real time and punishes anyone mass-deleting or creating channels and roles, before the damage spreads.",
    className: "md:col-span-2",
    highlight: true,
  },
  {
    icon: Users,
    title: "Anti-raid",
    body: "Detects join floods and stops them with the punishment you choose.",
  },
  {
    icon: UserCheck,
    title: "Verification",
    body: "A one-click panel that gives members their role once verified.",
  },
  {
    icon: ScrollText,
    title: "Logging",
    body: "Messages, members, roles, channels and voice, logged where you want without spam.",
  },
  {
    icon: KeyRound,
    title: "SUDO mode",
    body: "Sensitive changes require the owner's password, so a compromised admin can't switch your protection off.",
  },
  {
    icon: DatabaseBackup,
    title: "Backups",
    body: "Snapshot your security setup and restore it in seconds.",
  },
  {
    icon: FileClock,
    title: "Audit trail",
    body: "Every configuration change is recorded and announced in your log channel.",
    className: "md:col-span-2",
  },
];

const apiExample = `PATCH /api/v1/guilds/{id}/settings
Authorization: Bearer drew_••••••••

{
  "settings": {
    "anti_nuke_enabled": true,
    "nuke_punishment": "ban",
    "log_channel_id": "1234567890123456789"
  },
  "dry_run": true
}`;

const apiResponse = `{
  "applied": false,
  "changes": {
    "anti_nuke_enabled": { "old": false, "new": true },
    "nuke_punishment":   { "old": "none", "new": "ban" }
  }
}`;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="noise relative isolate overflow-hidden pb-20 pt-32 sm:pt-40">
        <div className="dot-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <Aurora className="-z-10" />
        <CommandField className="-z-10" />
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="animate-fade-up mx-auto mb-8 flex w-fit items-center justify-center">
            <div className="relative">
              <div className="absolute inset-[-30%] rounded-full bg-brand/25 blur-3xl" aria-hidden />
              <Image src="/brand/drew-icon.svg" unoptimized alt="Drew" width={112} height={112} priority className="animate-float relative" />
            </div>
          </div>
          <Link
            href="/developers"
            className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-3 py-1 text-xs text-soft backdrop-blur transition-colors hover:border-brand/40 hover:text-fg"
          >
            <span className="rounded-full bg-brand/15 px-2 py-0.5 font-medium text-brand">New</span>
            Let your AI configure Drew
            <ArrowRight className="size-3.5" />
          </Link>
          <h1 className="animate-fade-up mx-auto mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-7xl">
            Discord security <br className="hidden sm:block" />
            <span className="brand-text">that never sleeps.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-soft [animation-delay:80ms]">
            Anti-nuke, anti-raid, verification and logging in one bot. Configure it from Discord, the dashboard, or straight
            from your AI agent.
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3 [animation-delay:140ms]">
            <ButtonLink href={SITE.invite} external size="lg">
              <DiscordIcon /> Add to Discord
            </ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary" size="lg">
              Open dashboard <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
          <div className="animate-fade-up mt-16 [animation-delay:220ms]">
            <LiveStats />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative scroll-mt-24 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Protection</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Everything your server needs to stay standing.
            </h2>
            <p className="mt-4 text-lg text-soft">Set it up in minutes. Drew does the watching, 24/7.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body, className, highlight }) => (
              <article
                key={title}
                className={`surface surface-hover group relative overflow-hidden p-7 ${className ?? ""}`}
              >
                {highlight && (
                  <div className="absolute -right-16 -top-16 size-64 rounded-full bg-brand/15 blur-3xl" aria-hidden />
                )}
                <div className="relative inline-flex size-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </div>
                <h3 className="relative mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-mute">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* API for AI */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="min-w-0">
            <p className="eyebrow">Configuration API</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              The first security bot your AI can set up.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-soft">
              Create a scoped token with <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-sm text-fg">/api token create</code>, hand it
              to your assistant, and let it read the schema, preview changes with a dry run and apply them, with every step
              validated and audited.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-soft">
              {[
                [Sparkles, "Self-describing schema with types, ranges and descriptions"],
                [ShieldCheck, "Per-server tokens: read, write or admin, expiring and revocable"],
                [Bot, "Dry runs, atomic changes and a full audit trail"],
              ].map(([Icon, text]) => {
                const I = Icon as typeof Sparkles;
                return (
                  <li key={text as string} className="flex items-start gap-3">
                    <I className="mt-0.5 size-4 shrink-0 text-brand" />
                    {text as string}
                  </li>
                );
              })}
            </ul>
            <ButtonLink href="/developers" variant="secondary" className="mt-9">
              Read the API docs <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
          <div className="relative min-w-0">
            <div className="absolute inset-[-10%] -z-10 rounded-full bg-brand/10 blur-3xl" aria-hidden />
            <div className="surface overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="ml-2 font-mono text-xs text-mute">api.drewbot.xyz</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[0.78rem] leading-relaxed text-soft">
                <code>{apiExample}</code>
              </pre>
              <div className="border-t border-line bg-brand/[0.04]">
                <p className="px-5 pt-4 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-brand">200 · dry run</p>
                <pre className="overflow-x-auto px-5 pb-5 pt-2 font-mono text-[0.78rem] leading-relaxed text-brand-bright/90">
                  <code>{apiResponse}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 pb-28 pt-8 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand/30 bg-[linear-gradient(110deg,#41cf8b_0%,#2fae72_38%,#0e2a1d_78%,#07100c_100%)] px-8 py-16 sm:px-14">
          <div className="dot-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(90deg,transparent,black)]" aria-hidden />
          <Image
            src="/brand/drew-icon.svg" unoptimized
            alt=""
            width={340}
            height={340}
            className="pointer-events-none absolute -bottom-20 right-[-40px] opacity-25 sm:right-10 sm:opacity-40"
          />
          <div className="relative max-w-xl">
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.03em] text-[#03110a] sm:text-5xl">
              Protect your server in under a minute.
            </h2>
            <p className="mt-4 text-lg text-[#06301c]">Invite Drew, run /opsec setup, and sleep well tonight.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={SITE.invite}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#03110a] px-6 text-[0.95rem] font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                <DiscordIcon /> Add to Discord
              </a>
              <a
                href={SITE.support}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white/25 px-6 text-[0.95rem] font-medium text-[#03110a] ring-1 ring-inset ring-black/10 transition-colors hover:bg-white/35"
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
