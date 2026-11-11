import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { PageHero } from "@/components/page-hero";

export default function NotFound() {
  return (
    <div className="pb-24">
      <PageHero eyebrow="404" title={<>This page <span className="brand-text">flew away</span></>}>
        We couldn&apos;t find what you were looking for.
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">
            <ArrowLeft className="size-4" /> Back home
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            Go to dashboard
          </ButtonLink>
        </div>
      </PageHero>
    </div>
  );
}
