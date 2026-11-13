import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, localizePath, splitLocale } from "@/lib/locales";

// Per-request nonce Content-Security-Policy for every page. Next.js applies
// the nonce to its own scripts; nothing inline runs without it.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.discordapp.com",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self' https://discord.com",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join("; ");

  // Language routes: /es/..., /fr/... are served by the unprefixed page with
  // the locale passed in a header. English has no prefix and is the default.
  const { pathname, search } = request.nextUrl;
  const [locale, rest] = splitLocale(pathname);
  if (locale === DEFAULT_LOCALE) {
    // An unprefixed link followed by someone who chose another language.
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    if (isLocale(saved) && saved !== DEFAULT_LOCALE) {
      return NextResponse.redirect(new URL(localizePath(pathname, saved) + search, request.url));
    }
  }

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("x-drew-locale", locale);
  headers.set("Content-Security-Policy", csp);
  const response =
    locale === DEFAULT_LOCALE
      ? NextResponse.next({ request: { headers } })
      : NextResponse.rewrite(new URL(rest + search, request.url), { request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  if (locale !== DEFAULT_LOCALE && request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  // Prefetches go through the proxy too, so /es/... routes resolve for them.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/|og.png).*)"],
};
