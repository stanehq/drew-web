import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { canManage, exchangeCode, fetchGuilds, fetchUser, levelOf } from "./discord";
import { consumeOAuthState, createSession } from "./session";

/** Completes Discord OAuth: verifies state, opens a session, goes to /dashboard. */
export async function completeLogin(request: NextRequest) {
  const url = request.nextUrl;
  const restart = () => NextResponse.redirect(new URL("/api/auth/discord", url));
  const code = url.searchParams.get("code");
  // The state must match the cookie set when the login started in this
  // browser, otherwise someone could log the visitor into their account.
  if (!(await consumeOAuthState(url.searchParams.get("state"))) || !code) {
    return restart();
  }
  const token = await exchangeCode(code).catch(() => null);
  if (!token) return restart();
  const [user, guilds] = await Promise.all([fetchUser(token), fetchGuilds(token)]);
  if (!user) return restart();

  const session = await createSession({
    userId: user.id,
    name: user.global_name || user.username,
    avatar: user.avatar,
    token,
    guilds: (guilds ?? []).filter(canManage).map((g) => ({ id: g.id, level: levelOf(g) })),
  });
  if (!session) {
    return NextResponse.redirect(new URL("/dashboard?error=config", url));
  }
  return NextResponse.redirect(new URL("/dashboard", url));
}
