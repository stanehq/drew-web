import "server-only";
import { getShowcase, isApiConfigured } from "./drew";

export type PublicServer = { name: string; icon: string | null; members: number; verified: boolean; partnered: boolean };
export type PublicShowcase = { total: number; servers: PublicServer[] };

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
      servers: (Array.isArray(raw.guilds) ? raw.guilds : []).slice(0, 15).map((g) => ({
        name: String(g.name ?? "").slice(0, 100),
        icon: safeIcon(g.icon_url),
        members: Number(g.member_count) || 0,
        verified: g.verified === true,
        partnered: g.partnered === true,
      })),
    };
    cached = { at: Date.now(), data };
    return data;
  } catch {
    return cached?.data ?? null;
  }
}
