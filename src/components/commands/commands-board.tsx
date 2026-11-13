"use client";

import { useMemo, useState } from "react";
import {
  Search, X, ChevronRight, Shield, Server, Users, Headphones,
  Award, Gift, Sparkles, Smile, Clock3, Settings, Music2, Bot,
  MessageSquare, Ticket, LockKeyhole, Wrench, type LucideIcon,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import data from "@/lib/commands.json";

type Option = { name: string; type: string; required: boolean; description: string };
type Command = { name: string; description: string; notes: string[]; options: Option[] };
type Category = { id: string; label: string; intro: string; notes: string[]; commands: Command[] };
type CommandGroup = { name: string; commands: Command[] };

const CATEGORIES = data as Category[];
const TOTAL = CATEGORIES.reduce((n, c) => n + c.commands.length, 0);

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  opsec: Shield, sudo: LockKeyhole, mod: Shield, server: Server, autorole: Users,
  voicemaster: Headphones, levels: Award, giveaways: Gift, starboard: Sparkles,
  clownboard: Smile, reaction: Smile, counters: Clock3, music: Music2,
  tickets: Ticket, logging: MessageSquare, config: Settings, utility: Wrench,
  default: Bot,
};

function groupCommands(commands: Command[]): CommandGroup[] {
  const groups = new Map<string, Command[]>();
  for (const command of commands) {
    const root = command.name.trim().split(/\s+/)[0];
    groups.set(root, [...(groups.get(root) ?? []), command]);
  }
  return [...groups.entries()].map(([name, commands]) => ({ name, commands }));
}

function CommandDetails({ cmd }: { cmd: Command }) {
  const { t } = useI18n();
  return (
    <div className="border-t border-white/[0.06] px-5 pb-5 pt-4 sm:px-7">
      <p className="mb-3 text-sm leading-relaxed text-soft">{cmd.description}</p>
      {cmd.notes.map((note) => (
        <p key={note} className="mb-2 text-sm leading-relaxed text-mute">{note}</p>
      ))}
      {cmd.options.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs text-mute">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t("Option")}</th>
                <th className="px-4 py-2.5 font-medium">{t("Type")}</th>
                <th className="px-4 py-2.5 font-medium">{t("Required")}</th>
                <th className="px-4 py-2.5 font-medium">{t("Description")}</th>
              </tr>
            </thead>
            <tbody>
              {cmd.options.map((option) => (
                <tr key={option.name} className="border-t border-white/[0.06]">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[0.82rem] text-fg">{option.name}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-mute">{option.type}</td>
                  <td className="px-4 py-2.5">{option.required ? <span className="text-brand-bright">{t("Yes")}</span> : <span className="text-mute">{t("No")}</span>}</td>
                  <td className="px-4 py-2.5 text-soft">{option.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CommandGroupRow({ group, open, onToggle }: { group: CommandGroup; open: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#141414] transition-colors hover:border-white/[0.11]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-[74px] w-full items-center gap-4 px-5 text-left sm:px-7"
      >
        <code className="min-w-0 flex-1 truncate font-mono text-[1rem] font-semibold text-fg sm:text-[1.08rem]">{group.name}</code>
        <span className="shrink-0 text-sm text-mute">
          {group.commands.length} {group.commands.length === 1 ? t("subcommand") : t("subcommands")}
        </span>
        <ChevronRight className={`size-5 shrink-0 text-mute transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-white/[0.06]">
          {group.commands.map((cmd) => (
            <div key={cmd.name} className="border-b border-white/[0.05] last:border-b-0">
              <div className="flex items-center gap-3 px-5 py-3 sm:px-7">
                <code className="shrink-0 font-mono text-sm font-medium text-brand-bright">{cmd.name}</code>
                <span className="min-w-0 flex-1 text-sm text-mute">{cmd.description}</span>
              </div>
              {(cmd.notes.length > 0 || cmd.options.length > 0) && <CommandDetails cmd={cmd} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommandsBoard() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(CATEGORIES[0]?.id ?? "all");
  const [open, setOpen] = useState<string | null>(null);

  const counts = useMemo(() => new Map(CATEGORIES.map((category) => [category.id, category.commands.length])), []);
  const selected = CATEGORIES.find((category) => category.id === active) ?? CATEGORIES[0];

  const groups = useMemo(() => {
    if (!selected) return [];
    const q = query.trim().toLowerCase().replace(/^\//, "");
    const filtered = selected.commands.filter((command) =>
      `${command.name} ${command.description} ${command.notes.join(" ")} ${command.options.map((option) => option.name + " " + option.description).join(" ")}`.toLowerCase().includes(q)
    );
    return groupCommands(filtered);
  }, [selected, query]);

  const chooseCategory = (id: string) => {
    setActive(id);
    setOpen(null);
  };

  return (
    <>
      <PageHero title={t("Drew commands")}>
        {TOTAL} {t("slash commands, their options and who can use them")}
      </PageHero>

      <section className="mx-auto max-w-[1720px] px-5 pb-28 sm:px-8">
        <div className="mb-7">
          <label className="flex h-12 max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 transition-colors focus-within:border-brand/50">
            <Search className="size-4 shrink-0 text-mute" />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setOpen(null); }}
              placeholder={t("Search commands")}
              aria-label={t("Search commands")}
              className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-fg outline-none placeholder:text-mute"
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label={t("Clear")} className="text-mute hover:text-fg"><X className="size-4" /></button>}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_minmax(0,1fr)] xl:gap-14">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <p className="mb-4 px-3 text-sm font-medium text-mute">{t("Categories")}</p>
            <nav aria-label={t("Categories")} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category.id.toLowerCase()] ?? CATEGORY_ICONS.default;
                const selectedCategory = category.id === active;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => chooseCategory(category.id)}
                    aria-current={selectedCategory ? "page" : undefined}
                    className={`flex min-h-[58px] min-w-0 items-center gap-3 rounded-2xl border px-3 text-left transition-colors ${selectedCategory ? "border-brand/20 bg-brand/[0.12] text-fg" : "border-transparent text-soft hover:border-white/[0.06] hover:bg-white/[0.035]"}`}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${selectedCategory ? "border-brand/15 bg-brand/[0.10] text-brand-bright" : "border-white/[0.06] bg-white/[0.035] text-mute"}`}>
                      <Icon className="size-[19px]" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t(category.label)}</span>
                    <span className={`shrink-0 text-sm tabular-nums ${selectedCategory ? "text-soft" : "text-mute"}`}>{counts.get(category.id)}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            {selected && (
              <>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-fg">{t(selected.label)}</h2>
                    {selected.intro && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mute">{selected.intro}</p>}
                  </div>
                  <span className="shrink-0 pb-1 text-sm tabular-nums text-mute">{groups.reduce((n, group) => n + group.commands.length, 0)} {t("commands")}</span>
                </div>
                {selected.notes.length > 0 && (
                  <div className="mb-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                    {selected.notes.map((note) => <p key={note} className="text-sm leading-relaxed text-mute [&+p]:mt-2">{note}</p>)}
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {groups.map((group) => (
                    <CommandGroupRow
                      key={group.name}
                      group={group}
                      open={open === group.name}
                      onToggle={() => setOpen(open === group.name ? null : group.name)}
                    />
                  ))}
                  {groups.length === 0 && <p className="py-16 text-center text-mute">{t("No commands match your search")}</p>}
                </div>
              </>
            )}
            <p className="mt-12 text-center text-sm text-mute">
              {t("Full guides and examples in the")}{" "}
              <a href={SITE.docs} className="text-brand-bright underline decoration-brand/40 underline-offset-4 hover:decoration-brand">{t("Docs")}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
