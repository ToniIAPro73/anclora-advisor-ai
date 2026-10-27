import { NextResponse } from "next/server";
import { getNeonServiceJwk } from "@/lib/neon/service-jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const keys: unknown[] = [];
  const issuerUrl = process.env.ANCLORA_IDENTITY_ISSUER_URL?.trim();

  if (issuerUrl) {
    try {
      const response = await fetch(`${issuerUrl.replace(/\/$/, "")}/.well-known/jwks.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
      cache: "no-store",
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Identity signing keys are unavailable" }, { status: 503 });
      }

      const body: unknown = await response.json();
      if (body && typeof body === "object" && "keys" in body && Array.isArray(body.keys)) {
        keys.push(...body.keys);
      }
    } catch {
      return NextResponse.json({ error: "Identity signing keys are unavailable" }, { status: 503 });
    }
  }

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
