import Link from "next/link";
import { LEGAL_DOCS, loadLegal, type LegalSlug } from "@/lib/legal";

export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = await loadLegal(slug);
  return (
    <section className="pt-[76px]">
      <div className="mx-auto max-w-6xl">
        <header className="px-5 pb-12 pt-20 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">{doc.title}</h1>
          {doc.updated && <p className="mt-3 text-sm text-mute">{doc.updated}</p>}
        </header>
        <div className="grid gap-6 px-0 pb-28 lg:grid-cols-[240px_1fr] lg:px-5">
          <aside className="px-5 lg:px-0">
            <nav className="sticky top-[76px] p-4 sm:p-6" aria-label="Legal documents">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Documents</p>
              <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {LEGAL_DOCS.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/${d.slug}`}
                      aria-current={d.slug === slug ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        d.slug === slug ? "bg-white/10 text-fg" : "text-soft hover:bg-white/[0.04] hover:text-fg"
                      }`}
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {doc.toc.length > 0 && (
                <div className="mt-8 hidden lg:block">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">On this page</p>
                  <ul className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-2 text-[0.8rem]">
                    {doc.toc.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="text-mute transition-colors hover:text-fg">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </nav>
          </aside>
          {/* Our own legal text from content/legal, rendered on the server. */}
          <article className="legal surface min-w-0 px-5 py-8 sm:px-10" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </div>
      </div>
    </section>
  );
}
