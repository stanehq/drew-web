import "server-only";
import { getBotStatus } from "./drew";

const SHARD_STATES = new Set(["online", "connecting", "offline"]);
const SERVICE_STATES = new Set(["operational", "degraded", "down", "not_configured"]);

export type PublicShard = { id: number; status: "online" | "connecting" | "offline"; latencyMs: number; guilds: number; users: number };
export type PublicService = { status: "operational" | "degraded" | "down" | "not_configured"; latencyMs: number };
export type PublicStatus = {
  available: true;
  ready: boolean;
  guilds: number;
  users: number;
  commandsUsed: number;
  shardCount: number;
  latencyMs: number;
  uptimeSeconds: number;
  shards: PublicShard[];
  services: Record<string, PublicService>;
  updatedAt: string;
};

/** Public subset of the bot status: aggregate numbers only, no secrets. */
export async function getPublicStatus(): Promise<PublicStatus> {
  const s = await getBotStatus();
  return {
    available: true,
    ready: Boolean(s.ready),
    guilds: Number(s.guilds) || 0,
    users: Number(s.users) || 0,
    commandsUsed: Number(s.commands_used) || 0,
    shardCount: Number(s.shards) || 0,
    latencyMs: Math.round(Number(s.latency) || 0),
    uptimeSeconds: Number(s.uptime_seconds) || 0,
    shards: Object.values(s.shard_stats || {})
      .map((sh) => ({
        id: Number(sh.id) || 0,
        status: (SHARD_STATES.has(sh.status) ? sh.status : "offline") as PublicShard["status"],
        latencyMs: Math.round(Number(sh.latency) || 0),
        guilds: Number(sh.guilds) || 0,
        users: Number(sh.users) || 0,
      }))
      .sort((a, b) => a.id - b.id),
    services: Object.fromEntries(
      Object.entries(s.services || {}).map(([name, info]) => [
        name,
        {
          status: (SERVICE_STATES.has(info?.status) ? info.status : "down") as PublicService["status"],
          latencyMs: Math.round(Number(info?.latency_ms) || 0),
        },
      ]),
    ),
    updatedAt: s.timestamp || new Date().toISOString(),
  };
}
