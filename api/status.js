const { getBotStatus, isConfigured } = require("./_lib/drew");

const SERVICE_STATES = new Set(["operational", "degraded", "down", "not_configured"]);
const SHARD_STATES = new Set(["online", "connecting", "offline"]);

const toShards = (shardStats) =>
  Object.values(shardStats || {})
    .map((shard) => ({
      id: Number(shard.id) || 0,
      status: SHARD_STATES.has(shard.status) ? shard.status : "offline",
      latencyMs: Math.round(Number(shard.latency) || 0),
      guilds: Number(shard.guilds) || 0,
      users: Number(shard.users) || 0,
    }))
    .sort((a, b) => a.id - b.id);

const toServices = (services) =>
  Object.fromEntries(
    Object.entries(services || {}).map(([name, info]) => [
      name,
      {
        status: SERVICE_STATES.has(info?.status) ? info.status : "down",
        latencyMs: Math.round(Number(info?.latency_ms) || 0),
      },
    ]),
  );

// Public status payload for /status.html: per-shard state and service
// health. Cached briefly at the edge so the bot API isn't hit per visitor.
module.exports = async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!isConfigured()) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(503).json({ available: false });
  }

  try {
    const status = await getBotStatus();
    response.setHeader("Cache-Control", "public, s-maxage=15, stale-while-revalidate=30");
    return response.status(200).json({
      available: true,
      ready: Boolean(status.ready),
      guilds: Number(status.guilds) || 0,
      users: Number(status.users) || 0,
      shardCount: Number(status.shards) || 0,
      latencyMs: Math.round(Number(status.latency) || 0),
      uptimeSeconds: Number(status.uptime_seconds) || 0,
      shards: toShards(status.shard_stats),
      services: toServices(status.services),
      updatedAt: status.timestamp || new Date().toISOString(),
    });
  } catch (_error) {
    response.setHeader("Cache-Control", "public, s-maxage=5");
    return response.status(503).json({ available: false });
  }
};
