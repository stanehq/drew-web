import type { Metadata } from "next";
import { PricingBoard } from "@/components/pricing/pricing-board";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Drew Premium from $2.83 a month. Start with a 5-day free trial, cancel anytime before it ends and pay nothing.",
};

export default function PricingPage() {
  return <PricingBoard />;
}
