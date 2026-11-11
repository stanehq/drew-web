import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

export const LEGAL_DOCS = [
  { slug: "terms", title: "Terms of Service", file: "terms.md" },
  { slug: "privacy", title: "Privacy Policy", file: "privacy.md" },
  { slug: "purchase-terms", title: "Purchase Terms", file: "purchase-terms.md" },
  { slug: "user-agreement", title: "User Agreement", file: "user-agreement.md" },
] as const;

export type LegalSlug = (typeof LEGAL_DOCS)[number]["slug"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Loads one of our own legal documents (trusted, versioned in this repo) and
 * renders it to HTML. The leading "# Title" and "Last updated" lines are
 * returned separately so the page can show them in its header.
 */
export async function loadLegal(slug: LegalSlug) {
  const doc = LEGAL_DOCS.find((d) => d.slug === slug)!;
  const raw = await readFile(path.join(process.cwd(), "content", "legal", doc.file), "utf8");
  let body = raw.replace(/^# .*\n+/, "");
  const updated = body.match(/^\*\*(Last updated[^*]+)\*\*\s*\n+/);
  if (updated) body = body.slice(updated[0].length);

  const toc: { id: string; text: string }[] = [];
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const id = slugify(text);
    if (depth === 2) toc.push({ id, text: text.replace(/<[^>]+>/g, "") });
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };
  renderer.link = function ({ href, tokens }) {
    const text = this.parser.parseInline(tokens);
    const external = /^https?:\/\//.test(href) && !href.startsWith("https://drewbot.xyz");
    return `<a href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${text}</a>`;
  };
  const html = await marked.parse(body, { renderer, gfm: true });
  return { ...doc, updated: updated?.[1].trim() ?? null, html, toc };
}
