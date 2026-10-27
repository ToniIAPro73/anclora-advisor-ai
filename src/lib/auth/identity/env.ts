export const ADVISOR_IDENTITY_APPLICATION_ID = "anclora-advisor-ai";

export interface AdvisorIdentityConfig {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sessionSecret: string;
}

export function isAncloraIdentityEnabled(): boolean {
  const serverEnabled = process.env.ANCLORA_IDENTITY_ENABLED === "true";
  const publicEnabled = process.env.NEXT_PUBLIC_ANCLORA_IDENTITY_ENABLED === "true";
  if (serverEnabled !== publicEnabled) {
    throw new Error("ANCLORA_IDENTITY_ENABLED and NEXT_PUBLIC_ANCLORA_IDENTITY_ENABLED must match");
  }
  return serverEnabled;
}

export function getAdvisorIdentityConfig(): AdvisorIdentityConfig {
  if (!isAncloraIdentityEnabled()) throw new Error("Anclora Identity integration is disabled");
  const config: AdvisorIdentityConfig = {
    issuerUrl: process.env.ANCLORA_IDENTITY_ISSUER_URL?.trim() ?? "",
    clientId: process.env.ANCLORA_IDENTITY_CLIENT_ID?.trim() ?? ADVISOR_IDENTITY_APPLICATION_ID,
    clientSecret: process.env.ANCLORA_IDENTITY_CLIENT_SECRET?.trim() ?? "",
    redirectUri: process.env.ANCLORA_IDENTITY_REDIRECT_URI?.trim() ?? "",
    sessionSecret: process.env.ANCLORA_IDENTITY_SESSION_SECRET?.trim() ?? "",
  };
  const missing = Object.entries(config).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required Anclora Identity settings: ${missing.join(", ")}`);
  if (config.sessionSecret.length < 32) throw new Error("ANCLORA_IDENTITY_SESSION_SECRET must contain at least 32 characters");
  if (!new URL(config.issuerUrl).protocol.startsWith("https") && process.env.NODE_ENV === "production") {
    throw new Error("Anclora Identity issuer must use HTTPS in production");
  }
  return config;
}
