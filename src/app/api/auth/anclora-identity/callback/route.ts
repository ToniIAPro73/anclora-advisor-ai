import { NextResponse } from "next/server";
import { createNeonServiceClient } from "@/lib/neon/server-admin";
import { getDatabaseProvider } from "@/lib/env";
import { createAdvisorIdentitySession } from "@/lib/auth/identity/session";
import { getAdvisorIdentityConfig, isAncloraIdentityEnabled } from "@/lib/auth/identity/env";
import { consumeAdvisorOidcState } from "@/lib/auth/identity/session";
import { getAdvisorIdentityOidcConfig, identityOidc } from "@/lib/auth/identity/oidc-client";
import { normalizeNextPath } from "@/lib/auth/identity/next-path";

export const runtime = "nodejs";

type IdentityClaims = {
  sub?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  platform_roles?: string[];
  application_memberships?: string[];
  application_roles?: Record<string, unknown>;
};

const APP_ID = "anclora-advisor-ai";
const APP_ROLES = new Set(["admin", "partner", "user"]);

export async function GET(request: Request) {
  if (!isAncloraIdentityEnabled()) return NextResponse.json({ error: "ANCLORA_IDENTITY_DISABLED" }, { status: 404 });
  const state = await consumeAdvisorOidcState();
  if (!state) return NextResponse.json({ error: "INVALID_OIDC_STATE" }, { status: 400 });
  if (getDatabaseProvider() !== "neon") return NextResponse.json({ error: "IDENTITY_REQUIRES_NEON_DATABASE" }, { status: 503 });

  const { redirectUri } = getAdvisorIdentityConfig();
  const oidc = await getAdvisorIdentityOidcConfig();
  const callbackUrl = new URL(redirectUri);
  new URL(request.url).searchParams.forEach((value, key) => callbackUrl.searchParams.set(key, value));

  let claims: IdentityClaims;
  try {
    const tokens = await identityOidc.authorizationCodeGrant(oidc, callbackUrl, {
      pkceCodeVerifier: state.codeVerifier,
      expectedState: state.state,
    });
    claims = tokens.claims() as IdentityClaims;
  } catch {
    return NextResponse.json({ error: "TOKEN_EXCHANGE_FAILED" }, { status: 400 });
  }

  const email = claims.email?.trim().toLowerCase();
  const applicationRole = claims.application_roles?.[APP_ID];
  const role = claims.platform_roles?.includes("GROUP_OWNER") ? "admin" : applicationRole;
  const hasMembership = claims.application_memberships?.includes(APP_ID) === true;
  if (!claims.sub || !email || claims.email_verified !== true || (!hasMembership && !claims.platform_roles?.includes("GROUP_OWNER")) || typeof role !== "string" || !APP_ROLES.has(role)) {
    return NextResponse.json({ error: "ADVISOR_ACCESS_DENIED" }, { status: 403 });
  }

  try {
    // Keep the legacy Advisor primary key because existing Neon records and RLS
    // policies are owned by this ID. Identity subjects are linked by verified email.
    const database = createNeonServiceClient();
    const { data: profile, error } = await database
      .from("users")
      .select("id,email,full_name,is_active")
      .eq("email", email)
      .maybeSingle<{ id: string; email: string; full_name: string | null; is_active: boolean | null }>();
    if (error || !profile || profile.is_active === false) {
      return NextResponse.json({ error: "ADVISOR_PROFILE_NOT_PROVISIONED_OR_INACTIVE" }, { status: 403 });
    }

    await createAdvisorIdentitySession({
      sub: claims.sub,
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name || claims.name || email,
      role: role as "admin" | "partner" | "user",
    });
    return NextResponse.redirect(new URL(normalizeNextPath(state.next), request.url));
  } catch (error) {
    console.error("Advisor Identity callback could not create an app session", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "ADVISOR_IDENTITY_SESSION_UNAVAILABLE" }, { status: 503 });
  }
}
