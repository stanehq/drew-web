"use client";

import { useState } from "react";
import { Check, ChevronDown, Clock3, Minus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { buttonClass } from "@/components/button";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

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

export function PricingBoard() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const { t } = useI18n();


  return (
    <>
      <section className="relative isolate overflow-hidden pt-[76px]">
        <div
          className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(65_207_139/0.18),transparent)] blur-2xl"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-20 text-center">
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
            {t("Protection for less than a coffee")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-balance text-soft">
            Try every Premium feature free for 5 days. Cancel before it ends and you won&apos;t pay a cent.
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

        <div className="mx-auto grid max-w-5xl gap-4 px-5 md:grid-cols-2">
          {PLANS.map((p) => {
            const yearly = +(p.monthly * 10).toFixed(2);
            const perMonth = billing === "monthly" ? p.monthly : yearly / 12;
            const perDay = perMonth / 30;
            const popular = "popular" in p && p.popular;
            return (
              <article key={p.id} className={`surface relative flex flex-col p-8 sm:p-10 ${popular ? "!border-brand/50" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight">{p.name}</h2>
                  {popular && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand-bright">
                      <Sparkles className="size-3.5" /> {t("Most popular")}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-soft">{t(p.blurb)}</p>

                <div className="mt-8 flex items-end gap-3">
                  <span className={`font-display text-6xl font-semibold tracking-[-0.02em] tabular-nums ${popular ? "text-brand-bright" : ""}`}>
                    {money(perMonth)}
                  </span>
                  <div className="pb-2 text-sm leading-tight text-mute">
                    <span>{t("/ month")}</span>
                  </div>
                </div>
                <p className="mt-2 h-5 text-sm text-mute">
                  {billing === "yearly" ? (
                    <>
                      {t("Billed ")}{money(yearly)}{t(" yearly. ")} <span className="text-brand">{t("You save ")}{money(p.monthly * 12 - yearly)}.</span>
                    </>
                  ) : (
                    <>That&apos;s just {money(perDay)} a day.</>
                  )}
                </p>

                <a
                  href={SITE.support}
                  target="_blank"
                  rel="noreferrer"
                  className={`${buttonClass(popular ? "primary" : "secondary", "lg")} mt-8 w-full`}
                >
                  {t("Start 5-day free trial")}
                </a>
                <p className="mt-3 text-center text-xs text-mute">{t("No charge today. Cancel anytime.")}</p>

                <ul className="mt-8 space-y-3 border-t border-white/10 pt-8 text-[0.95rem]">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-soft">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-4 grid max-w-5xl gap-4 px-5 sm:grid-cols-3">
          {[
            [Clock3, "5 days free", "Test everything before you pay."],
            [ShieldCheck, "Cancel anytime", "Stop renewals whenever you want."],
            [Zap, "Secure payments", "PayPal, cards and crypto."],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof Clock3;
            return (
              <div key={title as string} className="surface flex items-start gap-3 px-6 py-5">
                <I className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-medium">{t(title as string)}</p>
                  <p className="text-sm text-mute">{t(body as string)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison */}
      <section className="">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="pb-6 pt-20 text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{t("Compare plans")}</h2>
          <div className="surface overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-mute">
                  <th className="px-5 py-4 font-medium sm:px-6">{t("Feature")}</th>
                  <th className="w-40 px-4 py-4 font-medium">Standard</th>
                  <th className="w-40 px-4 py-4 font-medium text-brand-bright">Advanced</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, a, b]) => (
                  <tr key={label} className="border-b border-white/[0.06] last:border-b-0">
                    <td className="px-5 py-3.5 text-soft sm:px-6">{t(label)}</td>
                    {[a, b].map((v, i) => (
                      <td key={i} className="px-4 py-3.5">
                        {v === true ? (
                          <Check className="size-4 text-brand" aria-label={t("Included")} />
                        ) : v === false ? (
                          <Minus className="size-4 text-white/25" aria-label={t("Not included")} />
                        ) : (
                          <span className="text-fg">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 pb-28 pt-20 md:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{t("Questions?")}</h2>
            <p className="mt-3 text-soft">
              {t("Still unsure?")}{" "}
              <a href={SITE.support} className="text-brand-bright underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
                {t("Ask us on Discord")}
              </a>
              .
            </p>
          </div>
          <div className="surface px-5">
            {FAQ.map(([q, a]) => (
              <details key={t(q)} className="group border-b border-white/[0.06] last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium [&::-webkit-details-marker]:hidden">
                  {t(q)}
                  <ChevronDown className="size-4 shrink-0 text-mute transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-5 text-soft">{t(a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
