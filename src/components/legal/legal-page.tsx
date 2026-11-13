import { LegalTabs } from "@/components/legal/legal-tabs";
import { LEGAL_DOCS, loadLegal, type LegalSlug } from "@/lib/legal";
import { TwoTone } from "@/components/two-tone";

export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = await loadLegal(slug);
  return (
    <section className="w-full min-w-0 overflow-x-clip px-4 pb-28 pt-[76px] sm:px-5">
      <header className="pt-20 text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">
          <TwoTone text={doc.title} />
        </h1>
        {doc.updated && <p className="mt-3 text-sm text-mute">{doc.updated}</p>}
      </header>

      <LegalTabs tabs={LEGAL_DOCS.map(({ slug, title }) => ({ slug, title }))} active={slug} />

      <div className="mx-auto mt-10 w-full min-w-0 max-w-3xl">
        {/* Our own legal text from content/legal, rendered on the server. */}
        <article className="legal mx-auto w-full min-w-0" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </section>
  );
}
