import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Purchase Terms", description: "Subscriptions, trials, renewals, cancellations and refunds for Drew." };

export default function Page() {
  return <LegalPage slug="purchase-terms" />;
}
