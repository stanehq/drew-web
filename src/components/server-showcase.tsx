import {
  Activity,
  DatabaseBackup,
  KeyRound,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserCheck,
} from "lucide-react";

const modules = [
  { icon: ShieldAlert, title: "Anti-nuke", detail: "Stops destructive admin actions before they spread", tag: "Threat prevention" },
  { icon: ShieldCheck, title: "Anti-raid", detail: "Detects join floods and applies your response automatically", tag: "Live protection" },
  { icon: UserCheck, title: "Verification", detail: "Keeps unverified accounts away from protected channels", tag: "Member security" },
  { icon: ScrollText, title: "Audit logging", detail: "Tracks messages, members, roles, channels and voice events", tag: "Full visibility" },
  { icon: KeyRound, title: "SUDO mode", detail: "Requires owner authorization for sensitive configuration changes", tag: "Access control" },
  { icon: DatabaseBackup, title: "Backups", detail: "Snapshot your server security setup and restore it quickly", tag: "Recovery" },
  { icon: Terminal, title: "Configuration API", detail: "Manage protection through scoped, audited commands and API calls", tag: "Developer tools" },
  { icon: Activity, title: "Live monitoring", detail: "Watch gateway health, shards and bot activity in real time", tag: "Operations" },
];

const repeats = [...modules, ...modules];

/** Full-width carousel highlighting Drew's Discord security capabilities. */
export function ServerShowcase() {
  return (
    <section className="w-full overflow-hidden border-b border-line" aria-label="Drew security features">
      <div className="border-b border-line px-5 py-4 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand">Drew protection suite</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-fg">One bot. Multiple layers of server security.</h2>
      </div>
      <div className="group relative overflow-hidden py-7 [mask-image:linear-gradient(90deg,transparent,black_3%,black_97%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex gap-4" aria-hidden={copy === 1 || undefined}>
              {repeats.map(({ icon: Icon, title, detail, tag }, i) => (
                <li
                  key={`${copy}-${i}`}
                  className="relative flex h-[190px] w-[300px] shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-brand/15 bg-[#0c1511] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition-colors hover:border-brand/40 hover:bg-[#101d17] sm:w-[340px]"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-brand/[0.07] blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <span className="flex size-11 items-center justify-center rounded-lg border border-brand/20 bg-brand/[0.08] text-brand">
                      <Icon className="size-5" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-brand-bright">
                      <span className="size-1.5 rounded-full bg-brand" /> {tag}
                    </span>
                  </div>
                  <div className="relative">
                    <h3 className="text-lg font-semibold tracking-tight text-fg">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-soft">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
