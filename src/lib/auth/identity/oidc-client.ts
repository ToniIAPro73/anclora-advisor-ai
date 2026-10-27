import * as oidc from "openid-client";
import { getAdvisorIdentityConfig } from "./env";

let cached: oidc.Configuration | undefined;

export async function getAdvisorIdentityOidcConfig(): Promise<oidc.Configuration> {
  if (cached) return cached;
  const config = getAdvisorIdentityConfig();
  cached = await oidc.discovery(new URL(config.issuerUrl), config.clientId, config.clientSecret, oidc.ClientSecretBasic(config.clientSecret));
  return cached;
}

export const identityOidc = {
  buildAuthorizationUrl: oidc.buildAuthorizationUrl,
  authorizationCodeGrant: oidc.authorizationCodeGrant,
  randomPKCECodeVerifier: oidc.randomPKCECodeVerifier,
  calculatePKCECodeChallenge: oidc.calculatePKCECodeChallenge,
  randomState: oidc.randomState,
};

export function buildAdvisorIdentityLoginUrl(config: oidc.Configuration, input: { redirectUri: string; state: string; codeChallenge: string }): URL {
  return oidc.buildAuthorizationUrl(config, {
    redirect_uri: input.redirectUri,
    scope: "openid profile email anclora_platform",
    prompt: "login",
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
    state: input.state,
  });
}
