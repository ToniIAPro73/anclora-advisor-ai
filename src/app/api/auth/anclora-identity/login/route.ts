import { NextResponse } from "next/server";
import { normalizeNextPath } from "@/lib/auth/identity/next-path";
import { getAdvisorIdentityConfig, isAncloraIdentityEnabled } from "@/lib/auth/identity/env";
import { buildAdvisorIdentityLoginUrl, getAdvisorIdentityOidcConfig, identityOidc } from "@/lib/auth/identity/oidc-client";
import { storeAdvisorOidcState } from "@/lib/auth/identity/session";
import { createOidcStatePayload } from "@/lib/auth/identity/session-token";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAncloraIdentityEnabled()) return NextResponse.json({ error: "ANCLORA_IDENTITY_DISABLED" }, { status: 404 });
  const { redirectUri } = getAdvisorIdentityConfig();
  const oidc = await getAdvisorIdentityOidcConfig();
  const state = identityOidc.randomState();
  const codeVerifier = identityOidc.randomPKCECodeVerifier();
  const codeChallenge = await identityOidc.calculatePKCECodeChallenge(codeVerifier);
  const next = normalizeNextPath(new URL(request.url).searchParams.get("next"), "/dashboard/chat");
  await storeAdvisorOidcState(createOidcStatePayload({ state, codeVerifier, next }));
  return NextResponse.redirect(buildAdvisorIdentityLoginUrl(oidc, { redirectUri, state, codeChallenge }));
}
