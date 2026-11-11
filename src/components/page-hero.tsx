import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-36 sm:pt-44">
      <div className="line-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,black,transparent)]" />
      <div
        className="absolute left-1/2 top-0 -z-10 h-[360px] w-[760px] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(65_207_139/0.16),transparent)] blur-2xl"
        aria-hidden
      />
      <div className="animate-fade-up mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">{title}</h1>
        {children && <div className="mt-5 text-pretty text-lg leading-relaxed text-soft">{children}</div>}
      </div>
    </section>
  );
}
