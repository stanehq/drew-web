import { ChevronDown } from "lucide-react";
import Link from "@/components/locale-link";
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

      {/* Documents as tabs, like the navbar buttons */}
      <nav aria-label="Legal documents" className="mx-auto mt-10 flex max-w-3xl justify-center overflow-x-auto">
        <ul className="flex gap-1 rounded-xl border border-white/10 p-1">
          {LEGAL_DOCS.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/${d.slug}`}
                aria-current={d.slug === slug ? "page" : undefined}
                className={`block whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  d.slug === slug ? "bg-white/10 text-fg" : "text-soft hover:text-fg"
                }`}
              >
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto mt-10 max-w-3xl">
        {doc.toc.length > 0 && (
          <details className="group surface mb-10 px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
              On this page
              <ChevronDown className="size-4 text-mute transition-transform group-open:rotate-180" />
            </summary>
            <ol className="grid gap-x-6 gap-y-1.5 pb-5 text-sm sm:grid-cols-2">
              {doc.toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-mute transition-colors hover:text-fg">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        )}
        {/* Our own legal text from content/legal, rendered on the server. */}
        <article className="legal mx-auto" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </section>
  );
}
