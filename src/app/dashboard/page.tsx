import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, LogOut, Plus, Settings2, Shield } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { DiscordIcon } from "@/components/discord-icon";
import { PageHero } from "@/components/page-hero";
import { avatarUrl, canManage, fetchGuilds, guildIconUrl, inviteUrl, isAdmin, type DiscordGuild } from "@/lib/discord";
import { getInstalledGuilds, isApiConfigured, type GuildSummary } from "@/lib/drew";
import { formatExact } from "@/lib/format";
import { readSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

const PROTECTIONS: [keyof NonNullable<GuildSummary["settings"]>, string][] = [
  ["anti_nuke_enabled", "Anti-nuke"],
  ["anti_raid_enabled", "Anti-raid"],
  ["verification_enabled", "Verification"],
  ["logging_enabled", "Logs"],
];

function LoginPrompt({ expired }: { expired?: boolean }) {
  return (
    <div className="pb-28">
      <PageHero eyebrow="Dashboard" title={<>Manage your <span className="brand-text">servers</span></>}>
        {expired ? "Your session expired. Log in again to continue." : "Log in with Discord to see the servers you manage and configure Drew."}
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/api/auth/discord" size="lg">
            <DiscordIcon /> Log in with Discord
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-mute">We only ask for your profile and server list. Nothing is posted on your behalf.</p>
      </PageHero>
    </div>
  );
}

function GuildCard({ guild, installed, apiUp }: { guild: DiscordGuild; installed?: GuildSummary; apiUp: boolean }) {
  const icon = guildIconUrl(guild);
  return (
    <article className={`surface surface-hover relative flex flex-col overflow-hidden p-5 ${installed ?"border-brand/25":""}`}>
      {installed && <div className="absolute -right-16 -top-16 size-44 rounded-full bg-brand/10 blur-3xl" aria-hidden />}
      <div className="relative flex items-center gap-3.5">
        {icon ? (
          <Image src={icon} alt="" width={48} height={48} className="size-12 border border-line" />
        ) : (
          <div className="flex size-12 items-center justify-center border border-line bg-white/[0.05] font-semibold text-soft">
            {guild.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight">{guild.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5 text-[0.7rem]">
            {guild.owner ? (
              <span className="inline-flex items-center gap-1 bg-white/[0.08] px-2 py-0.5 text-fg"><Crown className="size-3" /> Owner</span>
            ) : isAdmin(guild) ? (
              <span className="bg-white/[0.06] px-2 py-0.5 text-soft">Admin</span>
            ) : (
              <span className="bg-white/[0.06] px-2 py-0.5 text-soft">Manager</span>
            )}
            {installed && <span className="bg-brand/15 px-2 py-0.5 text-brand">Drew active</span>}
          </div>
        </div>
      </div>
      {installed ? (
        <>
          <p className="relative mt-4 text-xs text-mute">{formatExact(installed.member_count)} members</p>
          {installed.settings && (
            <ul className="relative mt-3 grid grid-cols-2 gap-1.5 text-xs">
              {PROTECTIONS.map(([key, label]) => {
                const on = installed.settings?.[key];
                return (
                  <li key={key} className={`flex items-center gap-1.5 ${on ?"text-soft":"text-mute/70"}`}>
                    <span className={`size-1.5 rounded-full ${on ? "bg-brand" : "bg-white/20"}`} />
                    {label}
                    <span className="sr-only">{on ? "enabled" : "disabled"}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={`/dashboard/${guild.id}`}
            className="relative mt-5 inline-flex h-10 items-center justify-center gap-2 bg-white/[0.07] text-sm font-medium ring-1 ring-inset ring-line-strong transition-colors hover:bg-brand hover:text-[#03110a] hover:ring-brand"
          >
            <Settings2 className="size-4" /> Configure
          </Link>
        </>
      ) : apiUp ? (
        <>
          <p className="relative mt-4 flex-1 text-xs text-mute">Drew isn&apos;t in this server yet.</p>
          <a
            href={inviteUrl(guild.id)}
            className="relative mt-5 inline-flex h-10 items-center justify-center gap-2 bg-brand text-sm font-medium text-[#03110a] transition-colors hover:bg-brand-bright"
          >
            <Plus className="size-4" /> Add Drew
          </a>
        </>
      ) : null}
    </article>
  );
}

export default async function DashboardPage() {
  const session = await readSession();
  if (!session) return <LoginPrompt />;

  const guilds = await fetchGuilds(session.token).catch(() => null);
  if (!guilds) return <LoginPrompt expired />;

  const manageable = guilds.filter(canManage);
  let installed = new Map<string, GuildSummary>();
  let apiUp = false;
  if (isApiConfigured()) {
    try {
      installed = await getInstalledGuilds(manageable.map((g) => g.id));
      apiUp = true;
    } catch {
      apiUp = false;
    }
  }
  manageable.sort(
    (a, b) => Number(installed.has(b.id)) - Number(installed.has(a.id)) || a.name.localeCompare(b.name),
  );
  const withDrew = manageable.filter((g) => installed.has(g.id)).length;
  const protectedCount = manageable.filter((g) => {
    const s = installed.get(g.id)?.settings;
    return s && (s.anti_nuke_enabled || s.anti_raid_enabled);
  }).length;
  const avatar = avatarUrl({ id: session.uid, avatar: session.avatar });

  return (
    <div className="relative isolate">
      <div className="dot-grid absolute inset-x-0 top-0 -z-10 h-[520px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {avatar ? (
              <Image src={avatar} alt="" width={56} height={56} className="size-14 ring-2 ring-brand/50" />
            ) : (
              <div className="flex size-14 items-center justify-center bg-brand/20 text-xl font-semibold text-brand">
                {session.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Welcome back, {session.name}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/developers" variant="secondary" size="sm">
              API & AI <ArrowRight className="size-3.5" />
            </ButtonLink>
            <a href="/api/auth/logout" className="inline-flex h-9 items-center gap-2 px-3.5 text-sm text-mute hover:bg-white/[0.05] hover:text-fg">
              <LogOut className="size-4" /> Log out
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            ["Manageable servers", manageable.length],
            ["With Drew", apiUp ? withDrew : "..."],
            ["Protected", apiUp ? protectedCount : "..."],
          ].map(([label, value], i) => (
            <div key={label} className="surface p-5">
              <p className="text-xs text-mute">{label}</p>
              <p className={`mt-2 text-3xl font-semibold tabular-nums ${i === 2 ?"text-brand-bright":""}`}>{value}</p>
            </div>
          ))}
        </div>

        {!apiUp && (
          <p className="mt-6 flex items-center gap-2 border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
            <Shield className="size-4" /> Couldn&apos;t reach Drew right now. Server status will appear when it&apos;s back.
          </p>
        )}

        <h2 className="mt-12 text-lg font-semibold tracking-tight">Your servers</h2>
        {manageable.length === 0 ? (
          <p className="mt-4 text-mute">You don&apos;t manage any servers.</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manageable.map((g) => (
              <GuildCard key={g.id} guild={g} installed={installed.get(g.id)} apiUp={apiUp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
