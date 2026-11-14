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
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Patreon" className="size-9 shrink-0" fill="#FF424D" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit={2}>
                  <g transform="matrix(.47407 0 0 .47407 .383 .422)">
                    <defs>
                      <clipPath id="drew-patreon-clip">
                        <path d="M0 0h1080v1080H0z" />
                      </clipPath>
                    </defs>
                    <g clipPath="url(#drew-patreon-clip)">
                      <path d="M1033.05 324.45c-.19-137.9-107.59-250.92-233.6-291.7-156.48-50.64-362.86-43.3-512.28 27.2-181.1 85.46-237.99 272.66-240.11 459.36-1.74 153.5 13.58 557.79 241.62 560.67 169.44 2.15 194.67-216.18 273.07-321.33 55.78-74.81 127.6-95.94 216.01-117.82 151.95-37.61 255.51-157.53 255.29-316.38z" fillRule="nonzero" />
                    </g>
                  </g>
                </svg>
                <span className="text-lg font-bold tracking-tight text-white">Patreon</span>
              </div>
              <div className="flex min-h-16 items-center justify-center gap-3">
                <svg viewBox="0 0 21 28" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lemon Squeezy" className="size-9 shrink-0" fill="none">
                  <path fill="#FFC233" fillRule="evenodd" d="m6.92882 17.1856 7.51128 3.4727c.931.4306 1.5881 1.1533 1.943 1.9823.8976 2.0993-.3292 4.2463-2.255 5.0185-1.9262.7718-3.979.2751-4.91242-1.908l-3.26891-7.6645c-.25331-.5941.38303-1.1779.98205-.901Zm.45024-2.248 7.75364-2.931c2.5769-.9741 5.3918.869 5.3538 3.547-.0006.035-.0012.0699-.0021.1052-.0557 2.6078-2.7923 4.3606-5.3126 3.438l-7.7854-2.8495c-.62104-.2272-.62563-1.076-.00734-1.3097Zm-.43407-1.0152 7.62211-3.2387c2.5328-1.07634 3.1756-4.30675 1.1919-6.17327a9.026257 9.026257 0 0 0-.0783-.07315c-1.9449-1.80521-5.1599-1.16961-6.26712 1.20811L5.99323 12.9915c-.2729.5858.34387 1.1891.95176.9309Zm-1.9615-1.2798 2.77116-7.59845c.34357-.94215.27993-1.90295-.07526-2.73195C6.77994.21378 4.34409-.463579 2.41853.309741.493284 1.08336-.594621 2.84029.340622 5.02253L3.63095 12.6787c.25515.5933 1.13166.5699 1.35254-.0361Z" clipRule="evenodd" />
                </svg>
                <span className="text-base font-bold tracking-tight text-white">Lemon Squeezy</span>
              </div>
              <div className="flex min-h-16 items-center justify-center gap-3">
                <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="App Store" className="size-9 shrink-0">
                  <defs>
                    <linearGradient id="drew-app-store-gradient" gradientUnits="userSpaceOnUse" x1="400.05" y1="798.7717" x2="400.05" y2="-1.2283" gradientTransform="matrix(1 0 0 -1 0 798.7717)">
                      <stop offset="0" stopColor="#18BFFB" />
                      <stop offset="1" stopColor="#2072F3" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#drew-app-store-gradient)" d="M638.4,0H161.6C72.3,0,0,72.3,0,161.6v476.9C0,727.7,72.3,800,161.6,800h476.9c89.2,0,161.6-72.3,161.6-161.6V161.6C800,72.3,727.7,0,638.4,0z" />
                  <path fill="#FFFFFF" d="M396.6,183.8l16.2-28c10-17.5,32.3-23.4,49.8-13.4s23.4,32.3,13.4,49.8L319.9,462.4h112.9c36.6,0,57.1,43,41.2,72.8H143c-20.2,0-36.4-16.2-36.4-36.4c0-20.2,16.2-36.4,36.4-36.4h92.8l118.8-205.9l-37.1-64.4c-10-17.5-4.1-39.6,13.4-49.8c17.5-10,39.6-4.1,49.8,13.4L396.6,183.8L396.6,183.8z M256.2,572.7l-35,60.7c-10,17.5-32.3,23.4-49.8,13.4S148,614.5,158,597l26-45C213.4,542.9,237.3,549.9,256.2,572.7L256.2,572.7z M557.6,462.6h94.7c20.2,0,36.4,16.2,36.4,36.4c0,20.2-16.2,36.4-36.4,36.4h-52.6l35.5,61.6c10,17.5,4.1,39.6-13.4,49.8c-17.5,10-39.6,4.1-49.8-13.4c-59.8-103.7-104.7-181.3-134.5-233c-30.5-52.6-8.7-105.4,12.8-123.3C474.2,318.1,509.9,380,557.6,462.6L557.6,462.6z" />
                </svg>
                <span className="text-sm font-semibold text-white">App Store</span>
              </div>
              <div className="flex min-h-16 items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 466 511.98" role="img" aria-label="Google Play" className="size-9 shrink-0" shapeRendering="geometricPrecision" fillRule="evenodd" clipRule="evenodd">
                  <g>
                    <path fill="#EA4335" fillRule="nonzero" d="M199.9 237.8l-198.5 232.37c7.22,24.57 30.16,41.81 55.8,41.81 11.16,0 20.93,-2.79 29.3,-8.37l0 0 244.16 -139.46 -130.76 -126.35z" />
                    <path fill="#FBBC04" fillRule="nonzero" d="M433.91 205.1l0 0 -104.65 -60 -111.61 110.22 113.01 108.83 104.64 -58.6c18.14,-9.77 30.7,-29.3 30.7,-50.23 -1.4,-20.93 -13.95,-40.46 -32.09,-50.22z" />
                    <path fill="#34A853" fillRule="nonzero" d="M199.42 273.45l129.85 -128.35 -241.37 -136.73c-8.37,-5.58 -19.54,-8.37 -30.7,-8.37 -26.5,0 -50.22,18.14 -55.8,41.86 0,0 0,0 0,0l198.02 231.59z" />
                    <path fill="#4285F4" fillRule="nonzero" d="M1.39 41.86c-1.39,4.18 -1.39,9.77 -1.39,15.34l0 397.64c0,5.57 0,9.76 1.4,15.34l216.27 -214.86 -216.28 -213.46z" />
                  </g>
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
                          <span className={i === 1 ? "font-semibold text-white" : "text-mute"}>{t(v)}</span>
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
