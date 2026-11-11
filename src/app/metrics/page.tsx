import type { Metadata } from "next";
import { MetricsBoard } from "@/components/metrics/metrics-board";
import { isApiConfigured, METRIC_RANGES, type MetricRange } from "@/lib/drew";
import { getPublicMetrics, type PublicMetrics } from "@/lib/public-metrics";

export const metadata: Metadata = {
  title: "Metrics",
  description: "Public growth and performance metrics for Drew: servers, members, commands and latency over time.",
};

export default async function MetricsPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const raw = (await searchParams).range;
  const range: MetricRange = METRIC_RANGES.includes(raw as MetricRange) ? (raw as MetricRange) : "24h";
  let initial: PublicMetrics | null = null;
  if (isApiConfigured()) initial = await getPublicMetrics(range).catch(() => null);
  return <MetricsBoard initial={initial} initialRange={range} />;
}
