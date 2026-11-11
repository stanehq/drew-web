import { NextResponse, type NextRequest } from "next/server";
import { isApiConfigured, patchGuildSettings } from "@/lib/drew";
import { canEdit, readSession, safeEqual } from "@/lib/session";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

const fail = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });

// Applies a settings change from the dashboard by forwarding it to the bot's
// public configuration API for the logged-in owner. Validation, audit and
// log-channel notices happen in the bot, the same as for API tokens.
export async function POST(request: NextRequest) {
  const session = await readSession();
  if (!session) return fail(401, "SESSION_EXPIRED", "Your session expired. Log in again.");

  // Same-origin + CSRF token: rejects cross-site writes.
  const origin = request.headers.get("origin") || "";
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    /* missing or invalid origin */
  }
  const csrf = request.headers.get("x-drew-csrf") || "";
  if (!originHost || originHost !== request.headers.get("host") || !csrf || !safeEqual(csrf, session.csrf)) {
    return fail(403, "CSRF", "Request blocked for security reasons. Reload the page.");
  }
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) {
    return fail(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return fail(413, "TOO_LARGE", "Request too large");
  let body: { guild_id?: unknown; settings?: unknown; dry_run?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return fail(400, "INVALID_BODY", "Invalid JSON body");
  }
  const guildId = String(body.guild_id ?? "");
  const settings = body.settings;
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return fail(422, "INVALID_BODY", "Missing settings");
  }
  if (!canEdit(session, guildId)) {
    return fail(403, "OWNER_ONLY", "Only the server owner can save changes from the website.");
  }
  if (!isApiConfigured()) return fail(503, "UNAVAILABLE", "The bot connection is not configured.");

  try {
    const result = await patchGuildSettings(guildId, session.uid, settings as Record<string, unknown>, body.dry_run === true);
    return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail(502, "BOT_UNAVAILABLE", "Couldn't reach the bot. Try again.");
  }
}
