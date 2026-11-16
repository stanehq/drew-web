import type { Metadata } from "next";
import { StatusBoard } from "@/components/status/status-board";
import { isApiConfigured } from "@/lib/drew";
import { getPublicStatus, type PublicStatus } from "@/lib/public-status";
import { getPublicMetrics } from "@/lib/public-metrics";
import type { History } from "@/components/status/uptime-history";

export const metadata: Metadata = {
  title: "Status",
  description: "Live status of Drew: shards, latency and services. Find which shard your server is on.",
};

export default async function StatusPage({ searchParams }: { searchParams: Promise<{ server?: string | string[] }> }) {
  const server = (await searchParams).server;
  const initialQuery = typeof server === "string" && /^\d{0,20}$/.test(server) ? server : "";
  let initial: PublicStatus | null = null;
  let history: History | null = null;
  if (isApiConfigured()) {
    // Both come in parallel, so the 30 day bar is already coloured when the page arrives.
    const [status, metrics] = await Promise.all([getPublicStatus().catch(() => null), getPublicMetrics("30d").catch(() => null)]);
    initial = status;
    history = metrics ? { points: metrics.points, to: metrics.to } : null;
  }
  return <StatusBoard initial={initial} initialHistory={history} initialQuery={initialQuery} />;
}
