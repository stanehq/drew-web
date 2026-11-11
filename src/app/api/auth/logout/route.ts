import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await clearSession();
  const res = NextResponse.redirect(new URL("/", request.nextUrl));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
