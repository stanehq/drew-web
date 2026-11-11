import "server-only";

// Discord OAuth helpers. The access token is only ever used server-side.

export const BOT_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1441457111409103010";
const API = "https://discord.com/api/v10";

const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;

export type DiscordUser = { id: string; username: string; global_name: string | null; avatar: string | null };
export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

const perms = (g: DiscordGuild) => {
  try {
    return BigInt(g.permissions ?? 0);
  } catch {
    return 0n;
  }
};

export const isAdmin = (g: DiscordGuild) => (perms(g) & ADMINISTRATOR) === ADMINISTRATOR;
export const canManage = (g: DiscordGuild) => g.owner || isAdmin(g) || (perms(g) & MANAGE_GUILD) === MANAGE_GUILD;
export const levelOf = (g: DiscordGuild) => (g.owner ? "o" : isAdmin(g) ? "a" : "m") as "o" | "a" | "m";

export const avatarUrl = (u: { id: string; avatar: string | null }) =>
  u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128` : null;

export const guildIconUrl = (g: { id: string; icon: string | null }) =>
  g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null;

export const inviteUrl = (guildId?: string) => {
  const params = new URLSearchParams({
    client_id: BOT_CLIENT_ID,
    permissions: "8",
    integration_type: "0",
    scope: "bot applications.commands",
  });
  if (guildId) {
    params.set("guild_id", guildId);
    params.set("disable_guild_select", "true");
  }
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
};

export async function exchangeCode(code: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) throw new Error("Discord OAuth is not configured");
  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return typeof data.access_token === "string" && data.access_token ? data.access_token : null;
}

async function discordGet<T>(path: string, token: string): Promise<T | null> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export const fetchUser = (token: string) => discordGet<DiscordUser>("/users/@me", token);
export const fetchGuilds = async (token: string) => {
  const guilds = await discordGet<DiscordGuild[]>("/users/@me/guilds", token);
  return Array.isArray(guilds) ? guilds : null;
};
