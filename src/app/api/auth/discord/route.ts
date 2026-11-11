import { NextResponse } from "next/server";
import { createOAuthState, readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Already signed in: skip Discord and open the dashboard.
  if (await readSession()) {
    const res = NextResponse.redirect(new URL("/dashboard", request.url));
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Discord OAuth is not configured." }, { status: 500 });
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    // Only what the dashboard needs: who you are and which servers you manage.
    scope: "identify guilds",
    // Binds the callback to this browser (prevents login CSRF).
    state: await createOAuthState(),
    prompt: "consent",
  });
  const res = NextResponse.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
