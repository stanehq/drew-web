import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API",
  description: "Read and change your server's Drew settings with a scoped, audited configuration API.",
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
