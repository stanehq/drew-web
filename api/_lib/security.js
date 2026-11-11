// Session, CSRF and HTTP hardening helpers for the server-side routes.
//
// Sessions are stateless: a signed, HttpOnly cookie that holds only the
// Discord user ID, display name and the IDs of the guilds the user can
// manage (as verified through Discord OAuth at login). The signing key is
// derived from DREW_API_KEY so no extra secret has to be configured.

const crypto = require("node:crypto");

const SESSION_COOKIE = "drew_session";
const STATE_COOKIE = "drew_oauth_state";
const SESSION_TTL_SECONDS = 60 * 60;
const STATE_TTL_SECONDS = 10 * 60;
const MAX_SESSION_GUILDS = 100;

const sessionKey = () => {
  const apiKey = process.env.DREW_API_KEY || "";
  if (!apiKey) {
    return null;
  }
  return crypto.createHmac("sha256", apiKey).update("drew-web-session-v1").digest();
};

const base64url = (buffer) => Buffer.from(buffer).toString("base64url");

const sign = (key, value) => base64url(crypto.createHmac("sha256", key).update(value).digest());

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const parseCookies = (request) => {
  const header = request.headers?.cookie || "";
  const cookies = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) {
      continue;
    }
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name && !(name in cookies)) {
      try {
        cookies[name] = decodeURIComponent(value);
      } catch {
        cookies[name] = value;
      }
    }
  }
  return cookies;
};

const isSecureRequest = (request) =>
  process.env.NODE_ENV === "production" ||
  request.headers?.["x-forwarded-proto"] === "https" ||
  Boolean(process.env.VERCEL);

const serializeCookie = (request, name, value, maxAgeSeconds) => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isSecureRequest(request)) {
    parts.push("Secure");
  }
  return parts.join("; ");
};

const appendCookie = (response, cookie) => {
  const existing = response.getHeader("Set-Cookie");
  const list = existing ? [].concat(existing) : [];
  list.push(cookie);
  response.setHeader("Set-Cookie", list);
};

// --- OAuth state (login CSRF) ---------------------------------------------

const createOAuthState = (request, response) => {
  const state = base64url(crypto.randomBytes(24));
  appendCookie(response, serializeCookie(request, STATE_COOKIE, state, STATE_TTL_SECONDS));
  return state;
};

const consumeOAuthState = (request, response, received) => {
  const expected = parseCookies(request)[STATE_COOKIE];
  appendCookie(response, serializeCookie(request, STATE_COOKIE, "", 0));
  return Boolean(expected && received && safeEqual(expected, received));
};

// --- Sessions --------------------------------------------------------------

// Access levels per guild, verified through Discord OAuth at login:
// "o" = owner (may change settings), "a" = administrator, "m" = manage server
// (view only). Changing settings from the website is owner-only so it can't
// bypass the SUDO protection Discord commands require from administrators.
const createSession = (request, response, { userId, name, guilds }) => {
  const key = sessionKey();
  if (!key) {
    return null;
  }
  const session = {
    v: 2,
    uid: String(userId),
    name: String(name || "").slice(0, 64),
    guilds: guilds
      .filter((g) => /^\d{17,20}$/.test(String(g.id)) && ["o", "a", "m"].includes(g.level))
      .slice(0, MAX_SESSION_GUILDS)
      .map((g) => [String(g.id), g.level]),
    csrf: base64url(crypto.randomBytes(18)),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payload = base64url(JSON.stringify(session));
  appendCookie(
    response,
    serializeCookie(request, SESSION_COOKIE, `${payload}.${sign(key, payload)}`, SESSION_TTL_SECONDS),
  );
  return session;
};

const readSession = (request) => {
  const key = sessionKey();
  const raw = parseCookies(request)[SESSION_COOKIE];
  if (!key || !raw) {
    return null;
  }
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !safeEqual(sign(key, payload), signature)) {
    return null;
  }
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session.v !== 2 || !/^\d{17,20}$/.test(session.uid) || !Array.isArray(session.guilds)) {
      return null;
    }
    if (typeof session.exp !== "number" || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const clearSession = (request, response) => {
  appendCookie(response, serializeCookie(request, SESSION_COOKIE, "", 0));
};

const guildLevel = (session, guildId) => {
  if (!session || !/^\d{17,20}$/.test(String(guildId))) {
    return null;
  }
  const entry = session.guilds.find(([id]) => id === String(guildId));
  return entry ? entry[1] : null;
};

const sessionCanView = (session, guildId) => guildLevel(session, guildId) !== null;
const sessionCanEdit = (session, guildId) => guildLevel(session, guildId) === "o";

// --- Request checks --------------------------------------------------------

// Rejects cross-site state-changing requests: the Origin (or Referer) must
// be this site and the CSRF token must match the session.
const isSameOriginWrite = (request, session) => {
  const host = request.headers?.host;
  const origin = request.headers?.origin || request.headers?.referer || "";
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const csrf = request.headers?.["x-drew-csrf"];
  return Boolean(host && originHost === host && session && csrf && safeEqual(csrf, session.csrf));
};

// --- Response hardening ----------------------------------------------------

const setHtmlSecurityHeaders = (response) => {
  response.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://cdn.discordapp.com",
      "connect-src 'self' https://va.vercel-scripts.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "object-src 'none'",
    ].join("; "),
  );
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "same-origin");
};

module.exports = {
  clearSession,
  consumeOAuthState,
  createOAuthState,
  createSession,
  isSameOriginWrite,
  readSession,
  guildLevel,
  sessionCanEdit,
  sessionCanView,
  setHtmlSecurityHeaders,
};
