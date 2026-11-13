"use client";

import { useState } from "react";
import { Highlight } from "@/components/highlight";
import { Check, Minus, Plus } from "lucide-react";
import { buttonClass } from "@/components/button";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { TwoTone } from "@/components/two-tone";

type Billing = "monthly" | "yearly";

// Prices in USD. Yearly = 10 months (2 months free).
const PLANS = [
  {
    id: "standard",
    name: "Standard",
    monthly: 2.83,
    blurb: "The full protection stack for growing communities.",
    features: [
      "Adaptive automod and filtered invites",
      "Anti-raid burst detection and lockdown",
      "Instant rollback for channel and role nukes",
      "Moderation summaries and reports",
      "Standard support",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    monthly: 6.83,
    popular: true,
    blurb: "Maximum coverage for servers that can't afford a bad day.",
    features: [
      "Everything in Standard",
      "Unlimited automod presets and server profiles",
      "Priority anti-raid monitoring and live alerts",
      "Custom bot name and avatar",
      "Extended audit logs and exports",
      "Priority support",
    ],
  },
] as const;

const COMPARE: [string, boolean | string, boolean | string][] = [
  ["Anti-nuke and anti-raid", true, true],
  ["Verification and logging", true, true],
  ["Instant rollback", true, true],
  ["Automod presets", "Core set", "Unlimited"],
  ["Audit log history", "Standard", "Extended"],
  ["Live incident alerts", false, true],
  ["Custom bot name and avatar", false, true],
  ["Exportable reports", false, true],
  ["Support", "Standard", "Priority"],
];

const FAQ = [
  [
    "How does the free trial work?",
    "New users get 5 days of Premium for free. Add a payment method to start it. Cancel before the trial ends and you pay nothing.",
  ],
  ["Can I cancel anytime?", "Yes. Cancelling stops future renewals and you keep Premium until the end of the period you paid for."],
  ["Can I switch plans later?", "Yes. Upgrade or downgrade whenever you want and the new price applies from your next billing cycle."],
  ["Which payment methods do you accept?", "PayPal, credit and debit cards and crypto. Apple Pay and Google Pay where available."],
  [
    "Do you offer refunds?",
    "Refunds are reviewed case by case. If you live in the EU you also have a 14-day right of withdrawal. Details are in our Purchase Terms.",
  ],
];

const money = (n: number) => `$${n.toFixed(2)}`;
// Monthly price shown for a plan: yearly billing is 10 months spread over 12.
const monthlyPrice = (monthly: number, billing: Billing) => (billing === "monthly" ? monthly : +(monthly * 10).toFixed(2) / 12);

export function PricingBoard() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [open, setOpen] = useState<number | null>(0);
  const { t } = useI18n();


  return (
    <>
      <section className="relative isolate overflow-hidden pt-[76px]">
        <div
          className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(65_207_139/0.18),transparent)] blur-2xl"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-20 text-center">
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-[-0.025em] sm:text-6xl"><TwoTone text={t("Protection for less than a coffee")} greenWords={2} /></h1>
          <p className="mx-auto mt-4 max-w-lg text-balance text-soft">
            <Highlight text={t("Try every Premium feature free for 5 days. Cancel before it ends and you won't pay a cent.")} />
          </p>

          <div role="radiogroup" aria-label={t("Billing period")} className="mx-auto mt-8 flex w-fit gap-1 rounded-xl border border-white/10 p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                role="radio"
                aria-checked={billing === b}
                onClick={() => setBilling(b)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                  billing === b ? "bg-white/10 text-fg" : "text-soft hover:text-fg"
                }`}
              >
                {b === "monthly" ? t("Monthly") : t("Yearly")}
                {b === "yearly" && (
                  <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[0.68rem] font-semibold text-brand-bright">
                    {t("2 MONTHS FREE")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-4 px-5 md:grid-cols-2 md:gap-6">
          {PLANS.map((p) => {
            const yearly = +(p.monthly * 10).toFixed(2);
            const perMonth = billing === "monthly" ? p.monthly : yearly / 12;
            const perDay = perMonth / 30;
            const popular = "popular" in p && p.popular;
            const diff = billing === "monthly" ? p.monthly - PLANS[0].monthly : (p.monthly - PLANS[0].monthly) * 10 / 12;
            // Standard stays quiet, Advanced is the obvious pick (decoy and anchoring).
            return (
              <article
                key={p.id}
                className={
                  popular
                    ? "relative flex flex-col rounded-[0.875rem] border border-brand/60 bg-[linear-gradient(180deg,rgb(65_207_139/0.10),rgb(65_207_139/0.02)_45%,transparent)] p-8 shadow-[0_30px_90px_-30px_rgb(65_207_139/0.45)] sm:p-10 md:-my-4 md:py-14"
                    : "surface relative flex flex-col p-8 opacity-90 sm:p-10"
                }
              >
                <h2 className={`font-sans text-2xl font-bold tracking-tight ${popular ? "text-white" : "text-soft"}`}>{t(p.name)}</h2>
                <p className="mt-2 text-soft">{t(p.blurb)}</p>

                <div className="mt-8 flex items-end gap-3">
                  <span className={`font-semibold tracking-[-0.03em] tabular-nums ${popular ? "text-6xl text-fg sm:text-7xl" : "text-5xl text-soft"}`}>
                    {money(perMonth)}
                  </span>
                  <span className="pb-2 text-sm text-mute">{t("/ month")}</span>
                </div>
                <p className="mt-2 min-h-5 text-sm text-mute">
                  {billing === "yearly" ? (
                    <>
                      {t("Billed ")}{money(yearly)}{t(" yearly. ")} {popular && <span className="text-brand-bright">{t("You save ")}{money(p.monthly * 12 - yearly)}.</span>}
                    </>
                  ) : (
                    <>{t("That's just ")}{money(perDay)}{t(" a day.")}</>
                  )}
                </p>
                {popular && (
                  <p className="mt-3 w-fit rounded-lg bg-brand/10 px-3 py-1.5 text-sm text-soft">
                    <span>
                      {t("Only ")}<span className="font-semibold text-brand-bright">{money(diff)}</span>{t(" more a month than Standard")}
                    </span>
                  </p>
                )}

                <a
                  href={SITE.support}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    popular
                      ? `${buttonClass("primary", "lg")} mt-8 w-full shadow-[0_10px_30px_-8px_rgb(65_207_139/0.6)]`
                      : "mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/10 text-sm font-medium text-soft transition-colors hover:border-white/20 hover:text-fg"
                  }
                >
                  {popular ? t("Start 5-day free trial") : t("Choose Standard")}
                </a>
                <p className="mt-3 text-center text-xs text-mute">{popular ? t("No charge today. Cancel anytime.") : "\u00a0"}</p>

                <ul className="mt-8 space-y-3 border-t border-white/10 pt-8 text-[0.95rem]">
                  {p.features.map((f) => (
                    <li key={f} className={`flex gap-3 ${popular ? "text-fg" : "text-mute"}`}>
                      <Check className={`mt-0.5 size-4 shrink-0 ${popular ? "text-brand-bright" : "text-white/35"}`} strokeWidth={popular ? 2.75 : 2} />
                      <span>
                        <Highlight text={t(f)} className={popular ? "font-medium text-brand-bright" : ""} />
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-5xl px-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-7 sm:px-8">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("Accepted Payments")}</h2>
            <div className="mt-7 grid grid-cols-2 items-center gap-6 sm:grid-cols-4 sm:gap-8">
              <div className="flex min-h-16 items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" role="img" aria-label="Patreon" className="size-9 shrink-0" fill="#FF424D">
                  <path d="M22.957 7.21c-.004-3.064-2.391-5.576-5.191-6.482-3.478-1.125-8.064-.962-11.384.604C2.357 3.231 1.093 7.391 1.046 11.54c-.039 3.411.302 12.396 5.369 12.46 3.765.047 4.326-4.804 6.068-7.141 1.24-1.662 2.836-2.132 4.801-2.618 3.376-.836 5.678-3.501 5.673-7.031Z" />
                </svg>
                <span className="text-lg font-bold tracking-tight text-white">Patreon</span>
              </div>
              <div className="flex min-h-16 items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" role="img" aria-label="Lemon Squeezy" className="size-9 shrink-0" fill="#FFC233">
                  <path d="m7.4916 10.835 2.3748-6.5114a3.1497 3.1497 0 0 0-.065-2.3418C9.0315.183 6.9427-.398 5.2928.265 3.643.929 2.71 2.4348 3.512 4.3046l2.8197 6.5615c.219.509.97.489 1.16-.03m1.6798 1.0969 6.5334-2.7758c2.1699-.9219 2.7218-3.6907 1.022-5.2905l-.068-.063c-1.6669-1.5469-4.4217-1.002-5.3706 1.0359L8.3566 11.135c-.234.503.295 1.0199.8159.7979m.373.87 6.6454-2.5119c2.2078-.8349 4.6206.745 4.5886 3.0398l-.002.09c-.048 2.2358-2.3938 3.7376-4.5536 2.9467l-6.6724-2.4418a.595.595 0 0 1-.006-1.1229m-.386 1.9269 6.4375 2.9767a3.2997 3.2997 0 0 1 1.6658 1.6989c.769 1.7998-.283 3.6396-1.9328 4.3016-1.6499.662-3.4097.235-4.2097-1.6359l-2.8027-6.5694c-.217-.509.328-1.009.8419-.772" />
                </svg>
                <span className="text-base font-bold tracking-tight text-white">Lemon Squeezy</span>
              </div>
              <div className="flex min-h-16 items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" role="img" aria-label="Apple" className="size-9 shrink-0" fill="#FFFFFF">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                <span className="text-sm font-semibold text-white">Apple App Store</span>
              </div>
              <div className="flex min-h-16 items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" role="img" aria-label="Google Play" className="size-9 shrink-0">
                  <path d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924Z" fill="#34A853" />
                  <path d="m13.544 10.989 3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973Z" fill="#4285F4" />
                  <path d="m13.544 13.056 3.23-3.21 5.244 2.966a1.49 1.49 0 0 1 0 2.594l-5.238 2.964-3.236-3.214Z" fill="#FBBC04" />
                  <path d="m13.544 13.056-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21Z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-bold text-white">Google Play</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section>
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="pb-10 pt-24 text-center text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">{t("Compare plans")}</h2>
          <div className="surface overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[0.95rem]">
              <thead>
                <tr>
                  <th className="px-6 pb-5 pt-6 align-bottom text-sm font-medium text-mute">{t("Feature")}</th>
                  <th className="w-44 px-4 pb-5 pt-6 align-bottom">
                    <p className="text-lg font-semibold text-soft">{t("Standard")}</p>
                    <p className="mt-0.5 text-sm font-normal text-mute">{money(monthlyPrice(PLANS[0].monthly, billing))} {t("/ month")}</p>
                  </th>
                  <th className="w-44 rounded-t-xl bg-brand/[0.07] px-4 pb-5 pt-6 align-bottom">
                    <p className="text-xl font-bold drew-title-green">{t("Advanced")}</p>
                    <p className="mt-0.5 text-sm font-normal text-mute">{money(monthlyPrice(PLANS[1].monthly, billing))} {t("/ month")}</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, a, b]) => (
                  <tr key={label} className="border-t border-white/[0.06] transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-soft">{t(label)}</td>
                    {[a, b].map((v, i) => (
                      <td key={i} className={`px-4 py-4 ${i === 1 ? "bg-brand/[0.07]" : ""}`}>
                        {v === true ? (
                          <span className={`inline-flex size-6 items-center justify-center rounded-full ${i === 1 ? "bg-brand/25 ring-1 ring-brand/35" : "bg-white/[0.05]"}`} aria-label={t("Included")}>
                            <Check className={`size-3.5 ${i === 1 ? "text-[#eafff4]" : "text-white/45"}`} strokeWidth={3} />
                          </span>
                        ) : v === false ? (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/[0.05]" aria-label={t("Not included")}>
                            <Minus className="size-3.5 text-white/30" strokeWidth={3} />
                          </span>
                        ) : (
                          <span className={i === 1 ? "font-semibold drew-title-green" : "text-mute"}>{t(v)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-white/[0.06]">
                  <td className="px-6 py-5" />
                  <td className="px-4 py-5">
                    <a href={SITE.support} target="_blank" rel="noreferrer" className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-lg border border-white/10 text-sm font-medium text-soft transition-colors hover:border-white/20 hover:text-fg">
                      {t("Choose Standard")}
                    </a>
                  </td>
                  <td className="rounded-b-xl bg-brand/[0.07] px-4 py-5">
                    <a href={SITE.support} target="_blank" rel="noreferrer" className={`${buttonClass("primary", "md")} w-full whitespace-nowrap shadow-[0_10px_30px_-8px_rgb(65_207_139/0.6)]`}>
                      {t("Start free trial")}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="mx-auto grid max-w-5xl gap-10 px-5 pb-28 pt-24 md:grid-cols-[1fr_1.7fr]">
          <div>
            <h2 className="text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">{t("Questions?")}</h2>
            <p className="mt-4 text-lg text-soft">
              {t("Still unsure?")}{" "}
              <a href={SITE.support} target="_blank" rel="noreferrer" className="text-brand-bright underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
                {t("Ask us on Discord")}
              </a>
            </p>
          </div>
          <div className="grid gap-3">
            {FAQ.map(([q, a], i) => {
              const isOpen = open === i;
              return (
                <div key={q} className={`surface transition-colors ${isOpen ? "!border-brand/40 !bg-brand/[0.04]" : "hover:!border-white/20"}`}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[1.02rem] font-semibold"
                  >
                    {t(q)}
                    <span className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-45 bg-brand text-[#03110a]" : "bg-white/[0.06] text-soft"}`}>
                      <Plus className="size-4" strokeWidth={2.25} />
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 leading-relaxed text-soft">
                        <Highlight text={t(a)} />
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
