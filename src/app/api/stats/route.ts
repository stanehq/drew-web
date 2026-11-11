import { NextResponse } from "next/server";
import { isApiConfigured } from "@/lib/drew";
import { getPublicStatus } from "@/lib/public-status";

export const dynamic = "force-dynamic";

// Public, cacheable bot stats. The bot API key stays on the server.
export async function GET() {
  if (!isApiConfigured()) {
    return NextResponse.json({ available: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const status = await getPublicStatus();
    return NextResponse.json(status, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ available: false }, { status: 503, headers: { "Cache-Control": "public, s-maxage=5" } });
  }
}
