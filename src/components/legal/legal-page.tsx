import { LegalTabs } from "@/components/legal/legal-tabs";
import { LEGAL_DOCS, loadLegal, type LegalSlug } from "@/lib/legal";
import { LegalHeading } from "@/components/legal/legal-heading";

export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = await loadLegal(slug);
  return (
    <section className="w-full min-w-0 overflow-x-clip px-4 pb-28 pt-[76px] sm:px-5">
      <LegalHeading title={doc.title} updated={doc.updated} />

      <LegalTabs tabs={LEGAL_DOCS.map(({ slug, title }) => ({ slug, title }))} active={slug} />

      <div className="mx-auto mt-10 w-full min-w-0 max-w-3xl">
        {/* Our own legal text from content/legal, rendered on the server. */}
        <article className="legal mx-auto w-full min-w-0" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </section>
  );
}
