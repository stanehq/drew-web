import type { Metadata, Viewport } from "next";
import { Albert_Sans, JetBrains_Mono, Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/lib/site";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const sans = Albert_Sans({ subsets: ["latin"], variable: "--font-albert", display: "swap" });
const display = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

// Every page is rendered per request so it carries the CSP nonce set in
// src/proxy.ts (static HTML could not include it).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Drew Bot: Discord security, done right", template: "Drew Bot: %s" },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: "Drew",
    url: SITE.url,
    title: "Drew Bot: Discord security, done right",
    description: SITE.description,
  },
  twitter: { card: "summary" },
};

export const viewport: Viewport = {
  // Discord and other embeds use this as the accent color.
  themeColor: "#41cf8b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-dvh overflow-x-hidden">
        <I18nProvider>
        <SiteHeader />
        <main className="relative">{children}</main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
        </I18nProvider>
      </body>
    </html>
  );
}
