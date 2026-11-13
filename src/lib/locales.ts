// Locale codes shared by the proxy (server) and the client i18n provider.
export const LOCALE_CODES = ["en", "es", "pt", "fr", "de", "ru"] as const;
export type LocaleCode = (typeof LOCALE_CODES)[number];
export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_COOKIE = "drew-locale";

export const isLocale = (v: unknown): v is LocaleCode => LOCALE_CODES.includes(v as LocaleCode);

/** Splits "/es/pricing" into ["es", "/pricing"]. English paths have no prefix. */
export function splitLocale(pathname: string): [LocaleCode, string] {
  const m = pathname.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (m && isLocale(m[1]) && m[1] !== DEFAULT_LOCALE) return [m[1], m[2] || "/"];
  return [DEFAULT_LOCALE, pathname];
}

/** Adds the locale prefix to an internal path ("/pricing" -> "/es/pricing"). */
export function localizePath(path: string, locale: LocaleCode): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith("/") || path.startsWith("//") || /^\/(api|_next|brand)(\/|$)/.test(path)) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#") || path.startsWith("/?")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}
