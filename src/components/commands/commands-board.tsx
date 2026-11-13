"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import data from "@/lib/commands.json";

type Option = { name: string; type: string; required: boolean; description: string };
type Command = { name: string; description: string; notes: string[]; options: Option[] };
type Category = { id: string; label: string; intro: string; notes: string[]; commands: Command[] };

const CATEGORIES = data as Category[];
const TOTAL = CATEGORIES.reduce((n, c) => n + c.commands.length, 0);

function CommandRow({ cmd, open, onToggle }: { cmd: Command; open: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  const [root, ...rest] = cmd.name.split(" ");
  const expandable = cmd.options.length > 0 || cmd.notes.length > 0;
  return (
    <li className="border-t border-white/[0.06] first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        disabled={!expandable}
        aria-expanded={expandable ? open : undefined}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors enabled:hover:bg-white/[0.02] sm:px-6"
      >
        <code className="shrink-0 font-mono text-[0.92rem]">
          <span className="text-brand-bright">{root}</span>
          {rest.length > 0 && <span className="text-fg"> {rest.join(" ")}</span>}
        </code>
        <span className="min-w-0 flex-1 truncate text-sm text-mute">{cmd.description}</span>
        {expandable && (
          <span className="flex shrink-0 items-center gap-2 text-xs text-mute">
            {cmd.options.length > 0 && <span className="hidden rounded-md bg-white/[0.05] px-2 py-0.5 sm:inline">{cmd.options.length} {cmd.options.length === 1 ? t("option") : t("options")}</span>}
            <ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </span>
        )}
      </button>
      {expandable && (
        <div className={`grid grid-cols-[minmax(0,1fr)] transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="px-5 pb-5 sm:px-6">
              {cmd.notes.map((n) => (
                <p key={n} className="mb-3 text-sm text-soft">{n}</p>
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
                      {cmd.options.map((o) => (
                        <tr key={o.name} className="border-t border-white/[0.06]">
                          <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[0.82rem] text-fg">{o.name}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-mute">{o.type}</td>
                          <td className="px-4 py-2.5">
                            {o.required ? <span className="text-brand-bright">{t("Yes")}</span> : <span className="text-mute">{t("No")}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-soft">{o.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export function CommandsBoard() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\//, "");
    return CATEGORIES.filter((c) => active === "all" || c.id === active)
      .map((c) => ({
        ...c,
        commands: q ? c.commands.filter((x) => `${x.name} ${x.description}`.toLowerCase().includes(q)) : c.commands,
      }))
      .filter((c) => c.commands.length > 0);
  }, [query, active]);

  const pill = (on: boolean) =>
    `shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${on ? "bg-white/10 text-fg" : "text-soft hover:bg-white/[0.05] hover:text-fg"}`;

  return (
    <>
      <PageHero title={t("Drew commands")}>
        {TOTAL} {t("slash commands, their options and who can use them")}
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 pb-28">
        <div className="sticky top-[84px] z-20 -mx-2 rounded-2xl bg-ink/90 px-2 pb-3 pt-2 backdrop-blur">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 focus-within:border-brand/50">
            <Search className="size-4 shrink-0 text-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search commands")}
              aria-label={t("Search commands")}
              className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-fg outline-none placeholder:text-mute"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label={t("Clear")} className="text-mute hover:text-fg">
                <X className="size-4" />
              </button>
            )}
          </label>
          <div className="mt-3 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button type="button" className={pill(active === "all")} onClick={() => setActive("all")}>
              {t("All")}
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className={pill(active === c.id)} onClick={() => setActive(c.id)}>
                {t(c.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-8">
          {shown.map((c) => (
            <div key={c.id} className="min-w-0">
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h2 className="font-sans text-xl font-semibold">{t(c.label)}</h2>
                <span className="text-xs text-mute">
                  {c.commands.length} {c.commands.length === 1 ? t("command") : t("commands")}
                </span>
              </div>
              {c.intro && <p className="mb-3 text-sm text-soft">{c.intro}</p>}
              {c.notes.length > 0 && (
                <ul className="mb-3 space-y-1 text-sm text-mute">
                  {c.notes.map((n) => (
                    <li key={n} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-brand" aria-hidden />
                      {n}
                    </li>
                  ))}
                </ul>
              )}
              <ul className="surface overflow-hidden">
                {c.commands.map((cmd) => (
                  <CommandRow key={cmd.name} cmd={cmd} open={open === cmd.name} onToggle={() => setOpen(open === cmd.name ? null : cmd.name)} />
                ))}
              </ul>
            </div>
          ))}
          {shown.length === 0 && <p className="py-16 text-center text-mute">{t("No commands match your search")}</p>}
        </div>

        <p className="mt-12 text-center text-sm text-mute">
          {t("Full guides and examples in the")}{" "}
          <a href={SITE.docs} className="text-brand-bright underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
            {t("Docs")}
          </a>
        </p>
      </section>
    </>
  );
}
