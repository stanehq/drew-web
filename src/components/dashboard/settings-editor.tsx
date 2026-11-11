"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Clock, Lock, ShieldAlert, ShieldCheck, ScrollText, UserCheck, Users, Loader2 } from "lucide-react";
import type { Channel, GuildInfo, Role, SchemaField, Settings } from "@/lib/drew";

const CATEGORIES: Record<string, { title: string; help: string; icon: typeof ShieldAlert }> = {
  anti_nuke: { title: "Anti-nuke", help: "Punish anyone mass-deleting or creating channels and roles.", icon: ShieldAlert },
  anti_raid: { title: "Anti-raid", help: "Detect and stop join floods.", icon: Users },
  blacklist: { title: "Blacklist", help: "Remove globally blacklisted users when they join.", icon: ShieldCheck },
  logging: { title: "Logs", help: "Where and what Drew logs.", icon: ScrollText },
  verification: { title: "Verification", help: "Role and channel of the verification panel.", icon: UserCheck },
  upcoming: { title: "Coming soon", help: "Stored now; they take effect when these modules ship.", icon: Clock },
};
const ORDER = ["anti_nuke", "anti_raid", "blacklist", "logging", "verification", "upcoming"];

const LABELS: Record<string, string> = {
  anti_nuke_enabled: "Enable anti-nuke",
  anti_raid_enabled: "Enable anti-raid",
  blacklist_enabled: "Enable blacklist",
  whitelist_user_ids: "Trusted users",
  whitelist_role_ids: "Trusted roles",
  log_channel_id: "Log channel",
  log_enabled_events: "Logged events",
  verification_role_id: "Verification role",
  verification_channel_id: "Verification channel",
};
const labelFor = (key: string) =>
  LABELS[key] ??
  key
    .replace(/_enabled$/, "")
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());

type Change = { old: unknown; new: unknown };
type FieldError = { key: string; message: string };

function Toggle({ checked, onChange, disabled, id }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-brand" : "bg-white/15"}`}
    >
      <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-fg placeholder:text-mute focus:border-brand/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function SettingsEditor({
  guild,
  schema,
  settings,
  channels,
  roles,
  canEdit,
  csrf,
}: {
  guild: GuildInfo;
  schema: SchemaField[];
  settings: Settings;
  channels: Channel[];
  roles: Role[];
  canEdit: boolean;
  csrf: string;
}) {
  const [baseline, setBaseline] = useState<Settings>(settings);
  const [values, setValues] = useState<Settings>(settings);
  const [preview, setPreview] = useState<Record<string, Change> | null>(null);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [busy, setBusy] = useState<"review" | "apply" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, SchemaField[]>();
    for (const f of schema) map.set(f.category, [...(map.get(f.category) ?? []), f]);
    return [...ORDER.filter((c) => map.has(c)), ...[...map.keys()].filter((c) => !ORDER.includes(c))].map(
      (c) => [c, map.get(c)!] as const,
    );
  }, [schema]);

  const pending = useMemo(() => {
    const out: Settings = {};
    for (const f of schema) {
      if (JSON.stringify(values[f.key] ?? null) !== JSON.stringify(baseline[f.key] ?? null)) out[f.key] = values[f.key];
    }
    return out;
  }, [values, baseline, schema]);
  const dirty = Object.keys(pending).length;

  const set = (key: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setPreview(null);
    setMessage(null);
    setErrors((e) => e.filter((x) => x.key !== key));
  };

  const nameFor = (key: string, v: unknown): string => {
    if (v === null || v === undefined || v === "") return "—";
    if (Array.isArray(v)) return v.length ? v.map((x) => nameFor(key, x)).join(", ") : "—";
    if (typeof v === "boolean") return v ? "on" : "off";
    const s = String(v);
    const ch = channels.find((c) => c.id === s);
    if (ch) return `#${ch.name}`;
    const r = roles.find((x) => x.id === s);
    if (r) return `@${r.name}`;
    return s;
  };

  const send = async (dryRun: boolean) => {
    const res = await fetch("/api/dashboard/settings", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Drew-CSRF": csrf },
      body: JSON.stringify({ guild_id: guild.id, settings: pending, dry_run: dryRun }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  };

  const fail = (data: { error?: { message?: string; fields?: FieldError[] } }) => {
    setErrors(data?.error?.fields ?? []);
    setMessage({ tone: "error", text: data?.error?.message ?? "Couldn't validate the changes." });
  };

  const review = async () => {
    setBusy("review");
    setMessage(null);
    try {
      const { ok, data } = await send(true);
      if (!ok) return fail(data);
      const changes = (data.changes ?? {}) as Record<string, Change>;
      if (!Object.keys(changes).length) {
        setMessage({ tone: "ok", text: "Nothing to change. Those values were already set." });
        return;
      }
      setPreview(changes);
    } catch {
      setMessage({ tone: "error", text: "Couldn't reach the server." });
    } finally {
      setBusy(null);
    }
  };

  const apply = async () => {
    setBusy("apply");
    try {
      const { ok, data } = await send(false);
      if (!ok) return fail(data);
      const next = (data.settings ?? values) as Settings;
      setBaseline(next);
      setValues(next);
      setPreview(null);
      setMessage({ tone: "ok", text: `Saved ${Object.keys(data.changes ?? {}).length} change(s). Recorded in the audit log.` });
    } catch {
      setMessage({ tone: "error", text: "Couldn't reach the server." });
    } finally {
      setBusy(null);
    }
  };

  const control = (f: SchemaField) => {
    const id = `f-${f.key}`;
    const v = values[f.key];
    const disabled = !canEdit;
    switch (f.type) {
      case "boolean":
        return <Toggle id={id} checked={Boolean(v)} disabled={disabled} onChange={(x) => set(f.key, x)} />;
      case "integer":
        return (
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={f.min}
            max={f.max}
            value={v === null || v === undefined ? "" : String(v)}
            disabled={disabled}
            onChange={(e) => set(f.key, e.target.value === "" ? null : Number(e.target.value))}
            className={`${inputCls} sm:w-32`}
          />
        );
      case "enum":
        return (
          <select id={id} value={String(v ?? "")} disabled={disabled} onChange={(e) => set(f.key, e.target.value)} className={`${inputCls} sm:w-44`}>
            {f.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      case "channel_id":
      case "role_id": {
        const items = f.type === "channel_id" ? channels.map((c) => [c.id, `#${c.name}`]) : roles.map((r) => [r.id, `@${r.name}`]);
        const current = v ? String(v) : "";
        return (
          <select id={id} value={current} disabled={disabled} onChange={(e) => set(f.key, e.target.value || null)} className={`${inputCls} sm:w-56`}>
            <option value="">None</option>
            {current && !items.some(([i]) => i === current) && <option value={current}>Unknown ({current})</option>}
            {items.map(([i, n]) => (
              <option key={i} value={i}>
                {n}
              </option>
            ))}
          </select>
        );
      }
      case "role_id_list": {
        const selected = new Set((v as string[]) ?? []);
        return (
          <div className="flex flex-wrap gap-1.5 sm:max-w-sm sm:justify-end">
            {roles.length === 0 && <span className="text-xs text-mute">No roles</span>}
            {roles.map((r) => {
              const on = selected.has(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={on}
                  onClick={() => {
                    const next = new Set(selected);
                    if (on) next.delete(r.id);
                    else next.add(r.id);
                    set(f.key, [...next]);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-brand bg-brand/15 text-brand" : "border-line text-soft hover:border-line-strong"}`}
                >
                  @{r.name}
                </button>
              );
            })}
          </div>
        );
      }
      case "user_id_list":
        return (
          <textarea
            id={id}
            rows={3}
            disabled={disabled}
            placeholder="One user ID per line"
            value={((v as string[]) ?? []).join("\n")}
            onChange={(e) => set(f.key, e.target.value.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean))}
            className={`${inputCls} h-auto py-2 font-mono sm:w-64`}
          />
        );
      case "string_set": {
        const list = (v as string[]) ?? ["all"];
        const all = list.includes("all");
        return (
          <div className="flex flex-wrap gap-1.5 sm:max-w-sm sm:justify-end">
            {["all", ...(f.options ?? [])].map((o) => {
              const on = o === "all" ? all : !all && list.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  disabled={disabled}
                  aria-pressed={on}
                  onClick={() => {
                    if (o === "all") return set(f.key, ["all"]);
                    const base = all ? [] : list;
                    const next = on ? base.filter((x) => x !== o) : [...base, o];
                    set(f.key, next.length ? next : ["all"]);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-brand bg-brand/15 text-brand" : "border-line text-soft hover:border-line-strong"}`}
                >
                  {o === "all" ? "Everything" : o}
                </button>
              );
            })}
          </div>
        );
      }
    }
  };

  return (
    <div className="relative isolate">
      <div className="dot-grid absolute inset-x-0 top-0 -z-10 h-[420px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="mx-auto max-w-6xl px-4 pb-40 pt-28 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-fg">
          <ArrowLeft className="size-4" /> Your servers
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {guild.icon_url ? (
            <Image src={guild.icon_url} alt="" width={64} height={64} className="size-16 rounded-2xl border border-line" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-white/[0.05] text-2xl font-semibold">
              {guild.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="eyebrow">Configuration</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{guild.name}</h1>
          </div>
        </div>

        <div
          className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${canEdit ? "border-brand/25 bg-brand/[0.06] text-soft" : "border-line bg-white/[0.03] text-soft"}`}
        >
          {canEdit ? <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" /> : <Lock className="mt-0.5 size-4 shrink-0 text-mute" />}
          <p>
            {canEdit
              ? "Changes are validated by the same API your tokens use, recorded in the audit log and announced in your log channel."
              : "Read-only: only the server owner can save changes from the website. Administrators can use /sudo in Discord or an /api token."}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[200px_1fr]">
          <nav className="sticky top-24 hidden h-fit space-y-1 lg:block" aria-label="Sections">
            {grouped.map(([cat]) => {
              const meta = CATEGORIES[cat] ?? { title: cat, icon: Clock };
              const Icon = meta.icon;
              return (
                <a key={cat} href={`#s-${cat}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-mute transition-colors hover:bg-white/[0.04] hover:text-fg">
                  <Icon className="size-4" /> {meta.title}
                </a>
              );
            })}
          </nav>

          <div className="space-y-6">
            {grouped.map(([cat, fields]) => {
              const meta = CATEGORIES[cat] ?? { title: cat, help: "", icon: Clock };
              const Icon = meta.icon;
              const body = (
                <ul className="divide-y divide-line">
                  {fields.map((f) => {
                    const err = errors.find((e) => e.key === f.key);
                    const changed = f.key in pending;
                    return (
                      <li key={f.key} className={`grid gap-3 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center ${f.privileged ? "bg-brand/[0.03]" : ""}`}>
                        <div>
                          <label htmlFor={`f-${f.key}`} className="flex flex-wrap items-center gap-2 text-sm font-medium">
                            {labelFor(f.key)}
                            {changed && <span className="size-1.5 rounded-full bg-brand" title="Unsaved" />}
                            {f.privileged && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 px-2 py-0.5 text-[0.65rem] font-normal text-brand">
                                <Lock className="size-3" /> Privileged
                              </span>
                            )}
                          </label>
                          <p className="mt-1 text-xs leading-relaxed text-mute">{f.description}</p>
                          {err && <p className="mt-1.5 text-xs text-bad">{err.message}</p>}
                        </div>
                        <div className="sm:justify-self-end">{control(f)}</div>
                      </li>
                    );
                  })}
                </ul>
              );
              return cat === "upcoming" ? (
                <details key={cat} id={`s-${cat}`} className="surface group scroll-mt-24 overflow-hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Icon className="size-5 text-mute" />
                      <div>
                        <h2 className="font-semibold tracking-tight">{meta.title}</h2>
                        <p className="text-xs text-mute">{meta.help}</p>
                      </div>
                    </div>
                    <span className="text-xs text-mute group-open:hidden">Show {fields.length}</span>
                  </summary>
                  <div className="border-t border-line">{body}</div>
                </details>
              ) : (
                <section key={cat} id={`s-${cat}`} className="surface scroll-mt-24 overflow-hidden" aria-labelledby={`h-${cat}`}>
                  <div className="flex items-center gap-3 border-b border-line px-6 py-5">
                    <div className="flex size-9 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h2 id={`h-${cat}`} className="font-semibold tracking-tight">
                        {meta.title}
                      </h2>
                      <p className="text-xs text-mute">{meta.help}</p>
                    </div>
                  </div>
                  {body}
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {canEdit && (dirty > 0 || message) && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:pb-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-line-strong bg-panel/95 p-4 shadow-[0_20px_60px_-15px_rgb(0_0_0/0.8)] backdrop-blur-xl">
            {preview && (
              <div className="mb-4 max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-black/30 p-3 font-mono text-xs">
                {Object.entries(preview).map(([k, c]) => (
                  <p key={k} className="flex flex-wrap gap-x-2">
                    <span className="text-fg">{k}</span>
                    <span className="text-mute line-through">{nameFor(k, c.old)}</span>
                    <span className="text-mute">→</span>
                    <span className="text-brand">{nameFor(k, c.new)}</span>
                  </p>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`flex items-center gap-2 text-sm ${message?.tone === "error" ? "text-bad" : message?.tone === "ok" ? "text-brand" : "text-soft"}`} aria-live="polite">
                {message?.tone === "error" ? <AlertTriangle className="size-4" /> : message?.tone === "ok" ? <Check className="size-4" /> : null}
                {message?.text ?? (preview ? "Review the changes and apply them." : `${dirty} unsaved change${dirty === 1 ? "" : "s"}`)}
              </p>
              {dirty > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValues(baseline);
                      setPreview(null);
                      setErrors([]);
                      setMessage(null);
                    }}
                    className="h-9 rounded-full px-4 text-sm text-mute hover:bg-white/[0.06] hover:text-fg"
                  >
                    Discard
                  </button>
                  {preview ? (
                    <button
                      type="button"
                      onClick={apply}
                      disabled={busy !== null}
                      className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-[#03110a] hover:bg-brand-bright disabled:opacity-60"
                    >
                      {busy === "apply" && <Loader2 className="size-4 animate-spin" />} Apply changes
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={review}
                      disabled={busy !== null}
                      className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
                    >
                      {busy === "review" && <Loader2 className="size-4 animate-spin" />} Review changes
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
