import { LegalTabs } from "@/components/legal/legal-tabs";
import { LEGAL_DOCS, loadLegal, type LegalSlug } from "@/lib/legal";
import { TwoTone } from "@/components/two-tone";

export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = await loadLegal(slug);
  return (
    <section className="px-5 pb-28 pt-[76px]">
      <header className="pt-20 text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
          <TwoTone text={doc.title} />
        </h1>
        {doc.updated && <p className="mt-3 text-sm text-mute">{doc.updated}</p>}
      </header>

      <LegalTabs tabs={LEGAL_DOCS.map(({ slug, title }) => ({ slug, title }))} active={slug} />

      <div className="mx-auto mt-10 max-w-3xl">
        {/* Our own legal text from content/legal, rendered on the server. */}
        <article className="legal mx-auto" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </section>
  );
}
