import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Drew collects, uses and protects personal data." };

export default function Page() {
  return <LegalPage slug="privacy" />;
}
