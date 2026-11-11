import type { Metadata } from "next";
import { Check, CreditCard, Crown } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { PageHero } from "@/components/page-hero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Premium",
  description: "Choose your protection level. Every Drew server starts with a 5-day free trial.",
};

const plans = [
  {
    name: "Standard",
    tagline: "Start with 5 days free, then keep the core stack.",
    price: "$3",
    copy: "All premium protection, plus a 5-day free trial to experience Drew's full suite.",
    features: [
      "Adaptive automod rules and filtered invites",
      "Anti-raid burst detection with lockdown toggles",
      "Instant rollback for channel and role nukes",
      "Community reports and moderation summaries",
      "Standard support response times",
    ],
    cta: "Get access",
  },
  {
    name: "Advanced",
    tagline: "Maximum coverage with priority escalations.",
    price: "$7",
    copy: "Elevated limits, branded automation, and the fastest response path for critical events.",
    features: [
      "Unlimited automod presets and server profiles",
      "Priority anti-raid monitoring and live incident alerts",
      "Custom bot name and avatar branding",
      "Extended audit logs and exportable reports",
      "Priority support with faster response times",
    ],
    cta: "Upgrade to Advanced",
    highlight: true,
  },
];

export default function PremiumPage() {
  return (
    <>
      <PageHero eyebrow="Premium" title={<>Choose your <span className="brand-text">protection level</span></>}>
        Drew ships as premium by default, with a 5-day free trial so you can test everything before you upgrade.
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {plans.map((p) => (
            <article
              key={p.name}
              className={`surface relative flex flex-col overflow-hidden p-8 ${p.highlight ? "border-brand/40 shadow-[0_30px_80px_-40px_rgb(65_207_139/0.6)]" : ""}`}
            >
              {p.highlight && <div className="absolute -right-20 -top-20 size-64 rounded-full bg-brand/20 blur-3xl" aria-hidden />}
              <div className="relative flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-mute">{p.name} plan</p>
                {p.highlight && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-[#03110a]">
                    <Crown className="size-3.5" /> Most popular
                  </span>
                )}
              </div>
              <h2 className="relative mt-4 text-xl font-semibold tracking-tight">{p.tagline}</h2>
              <p className="relative mt-6 flex items-baseline gap-1.5">
                <span className={`text-5xl font-semibold tracking-tight ${p.highlight ? "text-brand-bright" : ""}`}>{p.price}</span>
                <span className="text-mute">/ month</span>
              </p>
              <p className="relative mt-4 text-sm leading-relaxed text-soft">{p.copy}</p>
              <ul className="relative mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink href={SITE.support} external variant={p.highlight ? "primary" : "secondary"} className="relative mt-8 w-full">
                {p.cta}
              </ButtonLink>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-mute">
          <span className="font-mono text-xs uppercase tracking-[0.2em]">Accepted payments</span>
          {["Crypto", "PayPal", "Credit card"].map((m) => (
            <span key={m} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-soft">
              <CreditCard className="size-3.5 text-brand" /> {m}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
