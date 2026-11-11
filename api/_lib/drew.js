// Server-side client for the Drew bot API.
//
// Every request to /api/v1 must be signed with HMAC-SHA256 using the shared
// API key, exactly like the bot's own client does:
//   message   = `${timestamp}:${nonce}:${METHOD}:${pathWithQuery}:${body}`
//   signature = hex(HMAC_SHA256(API_KEY, message))
// The key never leaves the server: browsers only talk to our own /api routes.

const crypto = require("node:crypto");

const DEFAULT_TIMEOUT_MS = 5000;

class DrewApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "DrewApiError";
    this.status = status;
  }
}

const getConfig = () => {
  const baseUrl = (process.env.DREW_API_URL || "").replace(/\/+$/, "");
  const apiKey = process.env.DREW_API_KEY || "";
  return { baseUrl, apiKey, configured: Boolean(baseUrl && apiKey) };
};

const isConfigured = () => getConfig().configured;

const buildSignatureHeaders = (apiKey, method, pathWithQuery, body) => {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomBytes(16).toString("hex");
  const message = `${timestamp}:${nonce}:${method}:${pathWithQuery}:${body}`;
  const signature = crypto.createHmac("sha256", apiKey).update(message).digest("hex");

  // The key itself is never sent: the HMAC signature proves possession.
  return {
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
  };
};

/**
 * Performs a signed request against the Drew API and returns parsed JSON.
 * @param {string} pathWithQuery e.g. "/api/v1/client/status"
 */
const drewRequest = async (
  pathWithQuery,
  { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS, actor, allowErrorBody = false } = {},
) => {
  const { baseUrl, apiKey, configured } = getConfig();
  if (!configured) {
    throw new DrewApiError("Drew API is not configured", 503);
  }

  const payload = body === undefined ? "" : JSON.stringify(body);
  const headers = buildSignatureHeaders(apiKey, method, pathWithQuery, payload);
  if (payload) {
    headers["Content-Type"] = "application/json";
  }
  if (actor) {
    // The website acts for a Discord user it verified through OAuth; the bot
    // records this user in the settings audit log.
    headers["X-Drew-Actor"] = String(actor);
    headers["X-Drew-Source"] = "dashboard";
  }

  let response;
  try {
    response = await fetch(`${baseUrl}${pathWithQuery}`, {
      method,
      headers,
      body: payload || undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (_error) {
    throw new DrewApiError("Drew API is unreachable", 503);
  }

  if (!response.ok) {
    if (allowErrorBody && response.status < 500) {
      const errorBody = await response.json().catch(() => null);
      return { status: response.status, body: errorBody };
    }
    throw new DrewApiError(`Drew API responded with ${response.status}`, response.status);
  }

  const data = await response.json();
  return allowErrorBody ? { status: response.status, body: data } : data;
};

const guildPath = (guildId, suffix = "") => {
  if (!/^\d{17,20}$/.test(String(guildId))) {
    throw new DrewApiError("Invalid guild ID", 400);
  }
  return `/api/v1/guilds/${guildId}${suffix}`;
};

// Configuration API (the same public endpoints API tokens use).
const getSchema = () => drewRequest("/api/v1/schema");
const getGuild = (guildId, actor) => drewRequest(guildPath(guildId), { actor });
const getGuildSettings = (guildId, actor) => drewRequest(guildPath(guildId, "/settings"), { actor });
const getGuildChannels = (guildId, actor) => drewRequest(guildPath(guildId, "/channels"), { actor });
const getGuildRoles = (guildId, actor) => drewRequest(guildPath(guildId, "/roles"), { actor });
const patchGuildSettings = (guildId, actor, settings, dryRun) =>
  drewRequest(guildPath(guildId, "/settings"), {
    method: "PATCH",
    body: { settings, dry_run: Boolean(dryRun) },
    actor,
    allowErrorBody: true,
  });

const getBotStatus = () => drewRequest("/api/v1/client/status");

/**
 * Returns the subset of the given guild IDs where Drew is installed, keyed by
 * guild ID, including a security settings summary.
 * @param {string[]} guildIds
 */
const getInstalledGuilds = async (guildIds) => {
  const ids = [...new Set(guildIds.filter((id) => /^\d{1,20}$/.test(String(id))))].slice(0, 200);
  if (ids.length === 0) {
    return new Map();
  }

  // Commas are sent unencoded; the signature covers the exact string we send.
  const guilds = await drewRequest(`/api/v1/client/guilds?settings=true&ids=${ids.join(",")}`);
  return new Map((Array.isArray(guilds) ? guilds : []).map((guild) => [guild.id, guild]));
};

module.exports = {
  DrewApiError,
  getGuild,
  getGuildChannels,
  getGuildRoles,
  getGuildSettings,
  getSchema,
  patchGuildSettings,
  buildSignatureHeaders,
  drewRequest,
  getBotStatus,
  getInstalledGuilds,
  isConfigured,
};
