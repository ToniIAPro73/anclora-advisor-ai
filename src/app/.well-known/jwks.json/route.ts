import { NextResponse } from "next/server";
import { getPublicSupabaseUrl } from "@/lib/env";
import { getNeonServiceJwk } from "@/lib/neon/service-jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let upstreamKeys: unknown[];

  try {
    const supabaseUrl = getPublicSupabaseUrl().replace(/\/$/, "");
    const response = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Auth signing keys are unavailable" }, { status: 503 });
    }

    const body: unknown = await response.json();
    upstreamKeys =
      body && typeof body === "object" && "keys" in body && Array.isArray(body.keys)
        ? body.keys
        : [];
  } catch {
    return NextResponse.json({ error: "Auth signing keys are unavailable" }, { status: 503 });
  }

  const keys = [...upstreamKeys];
  if (process.env.NEON_SERVICE_JWT_PRIVATE_KEY) {
    try {
      keys.push(getNeonServiceJwk());
    } catch {
      return NextResponse.json({ error: "Service signing key is invalid" }, { status: 503 });
    }
  }

  return NextResponse.json(
    { keys },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );
}
