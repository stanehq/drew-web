import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

// Stateless, encrypted session cookie (AES-256-GCM: confidential and
// tamper-proof). It holds the Discord user, their access token (used only
// server-side to list their servers) and their access level per server as
// verified through Discord at login. The key is derived from DREW_API_KEY so
// no extra secret is needed.

export const SESSION_COOKIE = "drew_session";
export const STATE_COOKIE = "drew_oauth_state";
const SESSION_TTL_SECONDS = 60 * 60;
const STATE_TTL_SECONDS = 10 * 60;
const MAX_GUILDS = 75;

/** "o" owner (may change settings), "a" administrator, "m" manage server. */
export type Level = "o" | "a" | "m";

export type Session = {
  v: 3;
  uid: string;
  name: string;
  avatar: string | null;
  token: string;
  guilds: [string, Level][];
  csrf: string;
  exp: number;
};

const key = (purpose: string) => {
  const apiKey = process.env.DREW_API_KEY;
  if (!apiKey) return null;
  return crypto.createHmac("sha256", apiKey).update(`drew-web:${purpose}:v3`).digest();
};

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

const seal = (data: unknown): string | null => {
  const k = key("session");
  if (!k) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
};

const unseal = <T>(value: string): T | null => {
  const k = key("session");
  if (!k) return null;
  try {
    const raw = Buffer.from(value, "base64url");
    const decipher = crypto.createDecipheriv("aes-256-gcm", k, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const text = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const SNOWFLAKE = /^\d{17,20}$/;

export async function createSession(input: {
  userId: string;
  name: string;
  avatar: string | null;
  token: string;
  guilds: { id: string; level: Level }[];
}) {
  const session: Session = {
    v: 3,
    uid: input.userId,
    name: input.name.slice(0, 64),
    avatar: input.avatar,
    token: input.token,
    guilds: input.guilds
      .filter((g) => SNOWFLAKE.test(g.id))
      .slice(0, MAX_GUILDS)
      .map((g) => [g.id, g.level]),
    csrf: crypto.randomBytes(18).toString("base64url"),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const sealed = seal(session);
  if (!sealed) return null;
  (await cookies()).set(SESSION_COOKIE, sealed, cookieOptions(SESSION_TTL_SECONDS));
  return session;
}

export async function readSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const s = unseal<Session>(raw);
  if (!s || s.v !== 3 || !SNOWFLAKE.test(s.uid) || !Array.isArray(s.guilds)) return null;
  if (typeof s.exp !== "number" || s.exp < Math.floor(Date.now() / 1000)) return null;
  return s;
}

export async function clearSession() {
  (await cookies()).set(SESSION_COOKIE, "", cookieOptions(0));
}

export const guildLevel = (s: Session | null, guildId: string): Level | null =>
  s && SNOWFLAKE.test(guildId) ? (s.guilds.find(([id]) => id === guildId)?.[1] ?? null) : null;

// Changing settings from the website is owner-only, so it can't bypass the
// SUDO protection Discord commands require from administrators.
export const canEdit = (s: Session | null, guildId: string) => guildLevel(s, guildId) === "o";

// ---- OAuth state (login CSRF) ---------------------------------------------

export async function createOAuthState() {
  const state = crypto.randomBytes(24).toString("base64url");
  (await cookies()).set(STATE_COOKIE, state, cookieOptions(STATE_TTL_SECONDS));
  return state;
}

export async function consumeOAuthState(received: string | null) {
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.set(STATE_COOKIE, "", cookieOptions(0));
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
