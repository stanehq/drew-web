import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/lib/site";
import "./globals.css";

// Every page is rendered per request so it carries the CSP nonce set in
// src/proxy.ts (static HTML could not include it).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Drew — Discord security, done right", template: "%s · Drew" },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: "Drew",
    url: SITE.url,
    title: "Drew — Discord security, done right",
    description: SITE.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Drew" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#050807",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh overflow-x-hidden">
        <SiteHeader />
        <main className="relative">{children}</main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
