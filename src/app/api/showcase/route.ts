import { NextResponse } from "next/server";
import { getPublicShowcase } from "@/lib/public-showcase";

export const dynamic = "force-dynamic";

// Largest servers using Drew (people only, opted-out servers excluded).
export async function GET() {
  const data = await getPublicShowcase();
  if (!data) return NextResponse.json({ total: 0, totalMembers: 0, servers: [] }, { status: 503, headers: { "Cache-Control": "public, s-maxage=30" } });
  return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } });
}
