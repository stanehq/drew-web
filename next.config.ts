import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.discordapp.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Keep links to the previous static site working.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/status.html", destination: "/status", permanent: true },
      { source: "/premium.html", destination: "/pricing", permanent: true },
      { source: "/premium", destination: "/pricing", permanent: true },
      { source: "/developers.html", destination: "/developers", permanent: true },
      { source: "/404.html", destination: "/", permanent: true },
      {
        source: "/api/dashboard/guild",
        has: [{ type: "query", key: "id", value: "(?<id>\\d{17,20})" }],
        destination: "/dashboard/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
