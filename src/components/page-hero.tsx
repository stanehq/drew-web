import type { ReactNode } from "react";
import { TwoTone } from "@/components/two-tone";

export function PageHero({ title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-36 sm:pt-44">
      <div
        className="absolute left-1/2 top-0 -z-10 h-[360px] w-[760px] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(65_207_139/0.16),transparent)] blur-2xl"
        aria-hidden
      />
      <div className="animate-fade-up mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">{typeof title === "string" ? <TwoTone text={title} /> : title}</h1>
        {children && <div className="mx-auto mt-4 max-w-lg text-balance text-soft">{children}</div>}
      </div>
    </section>
  );
}
