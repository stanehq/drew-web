import "server-only";
import crypto from "node:crypto";

// Server-side client for the Drew bot API.
//
// Requests are signed with HMAC-SHA256 using the shared key, exactly like the
// bot's own client: message = `${ts}:${nonce}:${METHOD}:${pathWithQuery}:${body}`.
// The key itself is never sent and never reaches the browser.

export class DrewApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "DrewApiError";
  }
}

const DEFAULT_TIMEOUT_MS = 5000;
const SNOWFLAKE = /^\d{17,20}$/;

const config = () => {
  const baseUrl = (process.env.DREW_API_URL || "").replace(/\/+$/, "");
  const apiKey = process.env.DREW_API_KEY || "";
  return { baseUrl, apiKey, configured: Boolean(baseUrl && apiKey) };
};

export const isApiConfigured = () => config().configured;

type RequestOptions = {
  method?: "GET" | "PATCH" | "POST";
  body?: unknown;
  actor?: string;
  timeoutMs?: number;
  revalidate?: number;
};

export type ApiResult<T> = { status: number; body: T };

async function request<T>(path: string, opts: RequestOptions & { allowErrorBody: true }): Promise<ApiResult<T>>;
async function request<T>(path: string, opts?: RequestOptions): Promise<T>;
async function request<T>(path: string, opts: RequestOptions & { allowErrorBody?: boolean } = {}) {
  const { baseUrl, apiKey, configured } = config();
  if (!configured) {
    throw new DrewApiError("Drew API is not configured", 503);
  }
  const method = opts.method ?? "GET";
  const payload = opts.body === undefined ? "" : JSON.stringify(opts.body);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiKey)
    .update(`${timestamp}:${nonce}:${method}:${path}:${payload}`)
    .digest("hex");

  const headers: Record<string, string> = {
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
  };
  if (payload) headers["Content-Type"] = "application/json";
  if (opts.actor) {
    // The website acts for a Discord user it verified through OAuth; the bot
    // records this user in the settings audit log.
    headers["X-Drew-Actor"] = opts.actor;
    headers["X-Drew-Source"] = "dashboard";
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: payload || undefined,
      signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new DrewApiError("Drew API is unreachable", 503);
  }

  if (opts.allowErrorBody) {
    if (response.status >= 500) throw new DrewApiError(`Drew API responded with ${response.status}`, response.status);
    return { status: response.status, body: (await response.json().catch(() => null)) as T };
  }
  if (!response.ok) {
    throw new DrewApiError(`Drew API responded with ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

const guildPath = (guildId: string, suffix = "") => {
  if (!SNOWFLAKE.test(guildId)) throw new DrewApiError("Invalid guild ID", 400);
  return `/api/v1/guilds/${guildId}${suffix}`;
};

// ---- Types returned by the bot -------------------------------------------

export type ShardStat = { id: number; status: "online" | "connecting" | "offline"; guilds: number; users: number; latency: number };
export type ServiceInfo = { status: "operational" | "degraded" | "down" | "not_configured"; latency_ms: number };
export type BotStatus = {
  timestamp: string;
  guilds: number;
  users: number;
  channels: number;
  shards: number;
  latency: number;
  uptime_seconds: number;
  commands_used: number;
  ready: boolean;
  shard_stats: Record<string, ShardStat>;
  services: Record<string, ServiceInfo>;
};

export type GuildSummary = {
  id: string;
  name: string;
  icon_url: string | null;
  member_count: number;
  settings?: {
    anti_nuke_enabled: boolean;
    anti_raid_enabled: boolean;
    verification_enabled: boolean;
    logging_enabled: boolean;
  };
};

export type SchemaField = {
  key: string;
  type: "boolean" | "integer" | "enum" | "channel_id" | "role_id" | "user_id_list" | "role_id_list" | "string_set";
  category: string;
  description: string;
  default: unknown;
  options?: string[];
  min?: number;
  max?: number;
  max_items?: number;
  enforced: boolean;
  privileged: boolean;
};

export type Schema = { version: number; docs: string; fields: SchemaField[] };
export type Settings = Record<string, unknown>;
export type GuildInfo = { id: string; name: string; icon_url: string | null; member_count: number; owner_id: string };
export type Channel = { id: string; name: string; type: string; position: number };
export type Role = { id: string; name: string; position: number };

// ---- Internal (website) endpoints ------------------------------------------

export const getBotStatus = () => request<BotStatus>("/api/v1/client/status");

/** Returns the guilds (of the given IDs) that Drew is in, keyed by ID. */
export const getInstalledGuilds = async (guildIds: string[]) => {
  const ids = [...new Set(guildIds.filter((id) => SNOWFLAKE.test(id)))].slice(0, 200);
  if (ids.length === 0) return new Map<string, GuildSummary>();
  // Commas are sent unencoded; the signature covers the exact string we send.
  const guilds = await request<GuildSummary[]>(`/api/v1/client/guilds?settings=true&ids=${ids.join(",")}`);
  return new Map((Array.isArray(guilds) ? guilds : []).map((g) => [g.id, g]));
};

// ---- Public configuration API (same endpoints API tokens use) -------------

export const getSchema = () => request<Schema>("/api/v1/schema");
export const getGuild = (id: string, actor: string) => request<GuildInfo>(guildPath(id), { actor });
export const getGuildSettings = (id: string, actor: string) =>
  request<{ settings: Settings }>(guildPath(id, "/settings"), { actor });
export const getGuildChannels = (id: string, actor: string) =>
  request<{ channels: Channel[] }>(guildPath(id, "/channels"), { actor });
export const getGuildRoles = (id: string, actor: string) => request<{ roles: Role[] }>(guildPath(id, "/roles"), { actor });
export const patchGuildSettings = (id: string, actor: string, settings: Settings, dryRun: boolean) =>
  request<unknown>(guildPath(id, "/settings"), {
    method: "PATCH",
    body: { settings, dry_run: dryRun },
    actor,
    allowErrorBody: true,
  });

// ---- Public metrics (aggregates only) -------------------------------------

export type MetricPoint = {
  t: number;
  guilds: number;
  users: number;
  channels?: number;
  shards_online: number;
  shards_total: number;
  latency_ms: number;
  commands: number;
};

export type BotMetrics = {
  range: string;
  from: number;
  to: number;
  step_seconds: number;
  points: MetricPoint[];
  current: {
    guilds: number;
    users: number;
    channels?: number;
    shards_online: number;
    shards_total: number;
    latency_ms: number;
    commands_used: number;
    uptime_seconds?: number;
  };
};

export const METRIC_RANGES = ["24h", "7d", "30d", "90d"] as const;
export type MetricRange = (typeof METRIC_RANGES)[number];

export const getBotMetrics = (range: MetricRange) =>
  request<BotMetrics>(`/api/v1/client/metrics?range=${range}`, { timeoutMs: 8000 });
