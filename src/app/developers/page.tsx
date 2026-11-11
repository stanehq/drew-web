import type { Metadata } from "next";
import { Bot, FileClock, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { CodeBlock } from "@/components/code-block";
import { PageHero } from "@/components/page-hero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "API for developers & AI agents",
  description: "Configure Drew from code or let an AI set up your server with per-server API tokens. Schema, endpoints and examples.",
};

const endpoints: [string, string, string, string][] = [
  ["GET", "/schema", "none", "Every setting: type, options, range, description, enforced, privileged"],
  ["GET", "/me", "read", "Which server and scope this token has"],
  ["GET", "/guilds/{id}", "read", "Name, icon, member count, owner"],
  ["GET", "/guilds/{id}/channels", "read", "Text channels, to pick channel IDs"],
  ["GET", "/guilds/{id}/roles", "read", "Assignable roles, to pick role IDs"],
  ["GET", "/guilds/{id}/settings", "read", "Current settings"],
  ["PATCH", "/guilds/{id}/settings", "write", "Change settings (atomic, with dry_run)"],
  ["GET", "/guilds/{id}/audit", "read", "Recent changes and who made them"],
];

const curl = `curl -X PATCH ${SITE.api}/guilds/$GUILD_ID/settings \\
  -H "Authorization: Bearer $DREW_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "settings": {
      "anti_nuke_enabled": true,
      "nuke_punishment": "ban",
      "channel_delete_limit": 3
    },
    "dry_run": true
  }'`;

const response = `{
  "guild_id": "123456789012345678",
  "dry_run": true,
  "applied": false,
  "changes": {
    "nuke_punishment": { "old": "none", "new": "ban" }
  }
}`;

const prompt = `You can configure my Discord server's Drew bot through its API.
Base URL: ${SITE.api}
Token: read it from the DREW_TOKEN environment variable and never print it.

1. GET /me to learn the server ID.
2. GET /schema, then /guilds/{id}/settings, /channels and /roles.
3. Propose changes using only settings with "enforced": true.
4. PATCH /guilds/{id}/settings with "dry_run": true and show me the changes.
5. Only after I confirm, send the same PATCH with "dry_run": false.`;

const steps = [
  { n: "01", title: "Create a token", body: "Run /api token create in your server. Owner or active /sudo session required.", code: "/api token create name:claude scope:write expires:7" },
  { n: "02", title: "Discover", body: "Read the public schema and your server's channels and roles.", code: `GET ${SITE.api}/schema` },
  { n: "03", title: "Preview & apply", body: "Send a dry run, review the diff, then apply it for real.", code: `PATCH /guilds/{id}/settings` },
];

export default function DevelopersPage() {
  return (
    <>
      <PageHero eyebrow="Developers & AI agents" title={<>Configure Drew <span className="brand-text">with code</span></>}>
        Per-server tokens, a self-describing schema and dry runs, so scripts and AI assistants can set up your server
        safely, without the dashboard.
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="#quickstart">Quick start</ButtonLink>
          <ButtonLink href={`${SITE.api}/schema`} external variant="secondary">
            View the schema
          </ButtonLink>
        </div>
      </PageHero>

      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-24 sm:px-6">
        <section id="quickstart" className="grid scroll-mt-24 gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.n} className="surface flex flex-col p-6">
              <p className="font-mono text-sm text-brand">{s.n}</p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-mute">{s.body}</p>
              <code className="mt-5 block overflow-x-auto border border-line bg-[#030605] px-3 py-2 font-mono text-xs text-soft">{s.code}</code>
            </article>
          ))}
        </section>

        <section className="surface grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <p className="eyebrow">Example</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Preview, then apply a change</h2>
            <p className="mt-2 text-sm text-mute">Send the same request with <code className="font-mono text-soft">&quot;dry_run&quot;: false</code> to apply it. Discord IDs are always strings.</p>
          </div>
          <CodeBlock label="Request" code={curl} />
          <CodeBlock label="Response" code={response} />
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-line p-6 sm:p-8">
            <p className="eyebrow">Reference</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Endpoints</h2>
            <p className="mt-2 text-sm text-mute">
              Base URL <code className="font-mono text-soft">{SITE.api}</code> · header{" "}
              <code className="font-mono text-soft">Authorization: Bearer drew_…</code>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mute">
                  <th className="px-6 py-3 font-normal">Method</th>
                  <th className="px-6 py-3 font-normal">Path</th>
                  <th className="px-6 py-3 font-normal">Scope</th>
                  <th className="px-6 py-3 font-normal">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {endpoints.map(([m, p, s, d]) => (
                  <tr key={m + p}>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 font-mono text-xs ${m ==="PATCH"?"bg-brand/15 text-brand":"bg-white/[0.06] text-soft"}`}>{m}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-fg">{p}</td>
                    <td className="px-6 py-3.5 text-xs text-mute">{s}</td>
                    <td className="px-6 py-3.5 text-xs text-soft">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface relative overflow-hidden border-brand/30 p-6 sm:p-8">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand/15 blur-3xl" aria-hidden />
          <div className="relative">
            <p className="eyebrow">For AI agents</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Paste this into your assistant</h2>
            <div className="mt-5">
              <CodeBlock code={prompt} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {[
            [KeyRound, "Scoped tokens", "Random 256-bit secrets, stored hashed, one server each, expiring and revocable from Discord."],
            [ShieldCheck, "Validated", "Channels and roles are checked against your server, and @everyone and bot roles can't be whitelisted."],
            [FileClock, "Audited", "Every change is attributed in /audit and posted to your log channel."],
            [Sparkles, "Honest schema", "Settings marked enforced: false are stored but have no effect yet, so your AI won't be misled."],
            [Bot, "Rate limited", "120 reads and 30 changes per minute per token."],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof KeyRound;
            return (
              <div key={title as string} className="surface flex gap-4 p-5">
                <I className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <h3 className="font-medium">{title as string}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mute">{body as string}</p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
