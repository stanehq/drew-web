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

  return {
    Authorization: `Bearer ${apiKey}`,
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
  { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
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
    throw new DrewApiError(`Drew API responded with ${response.status}`, response.status);
  }

  return response.json();
};

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
  buildSignatureHeaders,
  drewRequest,
  getBotStatus,
  getInstalledGuilds,
  isConfigured,
};
