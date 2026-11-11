import type { NextRequest } from "next/server";
import { completeLogin } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return completeLogin(request);
}
