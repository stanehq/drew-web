import { NextResponse, type NextRequest } from "next/server";
import { isApiConfigured, METRIC_RANGES, type MetricRange } from "@/lib/drew";
import { getPublicMetrics } from "@/lib/public-metrics";

export const dynamic = "force-dynamic";

// Public, read-only, cached bot metrics (aggregates only).
export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") ?? "24h";
  if (!METRIC_RANGES.includes(range as MetricRange)) {
    return NextResponse.json({ error: "range must be one of 24h, 7d, 30d, 90d" }, { status: 400 });
  }
  if (!isApiConfigured()) {
    return NextResponse.json({ available: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const data = await getPublicMetrics(range as MetricRange);
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } });
  } catch {
    return NextResponse.json({ available: false }, { status: 503, headers: { "Cache-Control": "public, s-maxage=10" } });
  }
}
