const { getBotStatus, isConfigured } = require("./_lib/drew");

// Public, cacheable bot statistics for the landing page. Only aggregate
// numbers are exposed; the Drew API key stays on the server.
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
    response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json({
      available: true,
      ready: Boolean(status.ready),
      guilds: Number(status.guilds) || 0,
      users: Number(status.users) || 0,
      commandsUsed: Number(status.commands_used) || 0,
      shards: Number(status.shards) || 0,
      latencyMs: Math.round(Number(status.latency) || 0),
      uptimeSeconds: Number(status.uptime_seconds) || 0,
      updatedAt: status.timestamp || new Date().toISOString(),
    });
  } catch (_error) {
    response.setHeader("Cache-Control", "public, s-maxage=15");
    return response.status(503).json({ available: false });
  }
};
