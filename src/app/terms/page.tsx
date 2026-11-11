import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Service", description: "The terms that govern your use of Drew." };

export default function Page() {
  return <LegalPage slug="terms" />;
}
