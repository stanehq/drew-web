import "server-only";
import { getShowcase, isApiConfigured } from "./drew";

export const BADGES = ["verified", "partnered", "discoverable", "community"] as const;
export type Badge = (typeof BADGES)[number];
export type PublicServer = { name: string; icon: string | null; members: number; badge: Badge | null };
export type PublicShowcase = { total: number; totalMembers: number; servers: PublicServer[] };

// Older bot builds only send verified/partnered booleans.
const badgeOf = (g: { badge?: unknown; verified?: unknown; partnered?: unknown }): Badge | null =>
  BADGES.includes(g.badge as Badge) ? (g.badge as Badge) : g.verified === true ? "verified" : g.partnered === true ? "partnered" : null;

const TTL_MS = 5 * 60_000;
let cached: { at: number; data: PublicShowcase } | null = null;

const safeIcon = (url: unknown) =>
  typeof url === "string" && url.startsWith("https://cdn.discordapp.com/icons/") ? `${url.split("?")[0]}?size=128` : null;

/**
 * Largest servers using Drew, ranked by people (bots excluded), whitelisted
 * to display fields and cached for five minutes.
 */
export async function getPublicShowcase(): Promise<PublicShowcase | null> {
  if (!isApiConfigured()) return null;
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  try {
    const raw = await getShowcase();
    const data: PublicShowcase = {
      total: Number(raw.total_guilds) || 0,
      totalMembers: Number(raw.total_members) || 0,
      servers: (Array.isArray(raw.guilds) ? raw.guilds : []).slice(0, 15).map((g) => ({
        name: String(g.name ?? "").slice(0, 100),
        icon: safeIcon(g.icon_url),
        members: Number(g.member_count) || 0,
        badge: badgeOf(g),
      })),
    };
    cached = { at: Date.now(), data };
    return data;
  } catch {
    return cached?.data ?? null;
  }
}
