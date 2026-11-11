import type { Metadata } from "next";
import { StatusBoard } from "@/components/status/status-board";
import { isApiConfigured } from "@/lib/drew";
import { getPublicStatus, type PublicStatus } from "@/lib/public-status";

export const metadata: Metadata = {
  title: "Status",
  description: "Live status of Drew: shards, latency and services. Find which shard your server is on.",
};

export default async function StatusPage({ searchParams }: { searchParams: Promise<{ server?: string | string[] }> }) {
  const server = (await searchParams).server;
  const initialQuery = typeof server === "string" && /^\d{0,20}$/.test(server) ? server : "";
  let initial: PublicStatus | null = null;
  if (isApiConfigured()) {
    initial = await getPublicStatus().catch(() => null);
  }
  return <StatusBoard initial={initial} initialQuery={initialQuery} />;
}
