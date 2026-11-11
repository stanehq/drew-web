import type { ReactNode } from "react";
import { Aurora } from "./aurora";

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="noise relative isolate overflow-hidden pb-14 pt-32 sm:pt-40">
      <div className="dot-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Aurora className="-z-10 opacity-70" />
      <div className="animate-fade-up mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">{title}</h1>
        {children && <div className="mt-5 text-pretty text-lg leading-relaxed text-soft">{children}</div>}
      </div>
    </section>
  );
}
