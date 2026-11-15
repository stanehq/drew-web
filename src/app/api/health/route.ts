export const dynamic = "force-dynamic";

/** Liveness check for the container healthcheck. Touches nothing else. */
export function GET() {
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
