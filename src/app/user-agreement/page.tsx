import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "User Agreement", description: "Rules for your Drew account and dashboard." };

export default function Page() {
  return <LegalPage slug="user-agreement" />;
}
