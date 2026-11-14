import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { TwoTone } from "@/components/two-tone";

// 404: a big title and the two ways back. Icons are SVG (lucide).
export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80dvh] items-center justify-center overflow-hidden px-5 pb-24 pt-36">
      <div
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(65_207_139/0.16),transparent)] blur-2xl"
        aria-hidden
      />
      <div className="text-center">
        <h1 className="mx-auto max-w-[12ch] text-balance text-[clamp(3.5rem,11vw,9rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
          <TwoTone text="This page flew away" greenWords={1} />
        </h1>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">
            <ArrowLeft className="size-4" aria-hidden /> Back home
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            <LayoutDashboard className="size-4" aria-hidden /> Go to dashboard
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
