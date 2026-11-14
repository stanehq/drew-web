import { NextResponse } from "next/server";
import { CURRENCY_CODES, FALLBACK_RATES, type CurrencyCode } from "@/lib/currency";

// Live USD exchange rates for the pricing page. The provider updates once a
// day, so the result is cached for 6 hours on the server and at the edge:
// visitors never hit the provider directly and it can't rate limit us.
export const revalidate = 21600;

const SOURCE = "https://open.er-api.com/v6/latest/USD";

export async function GET() {
  let rates: Record<CurrencyCode, number> = FALLBACK_RATES;
  let live = false;
  let updated: number | null = null;
  try {
    const res = await fetch(SOURCE, { next: { revalidate } });
    const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number };
    if (res.ok && data.result === "success" && data.rates) {
      const picked = Object.fromEntries(CURRENCY_CODES.map((c) => [c, Number(data.rates?.[c])])) as Record<CurrencyCode, number>;
      if (CURRENCY_CODES.every((c) => picked[c] > 0)) {
        rates = picked;
        live = true;
        updated = data.time_last_update_unix ?? null;
      }
    }
  } catch {
    // Keep the fallback rates.
  }
  return NextResponse.json(
    { base: "USD", live, updated, rates },
    { headers: { "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=86400` } },
  );
}
