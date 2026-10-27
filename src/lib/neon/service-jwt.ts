import { createPrivateKey, createPublicKey, sign } from "node:crypto";

const DEFAULT_KID = "anclora-advisor-neon-service-v1";
const DEFAULT_AUDIENCE = "authenticated";
const DEFAULT_TTL_SECONDS = 300;

function getPrivateKey() {
  const value = process.env.NEON_SERVICE_JWT_PRIVATE_KEY;
  if (!value) {
    throw new Error("Missing required environment variable: NEON_SERVICE_JWT_PRIVATE_KEY");
  }

  const key = createPrivateKey(value.replace(/\\n/g, "\n"));
  if (key.asymmetricKeyType !== "ec" || key.asymmetricKeyDetails?.namedCurve !== "prime256v1") {
    throw new Error("Neon service JWT key must be an EC P-256 private key");
  }
  return key;
}

export function getNeonServiceJwk() {
  const jwk = createPublicKey(getPrivateKey()).export({ format: "jwk" });
  if (jwk.kty !== "EC" || jwk.crv !== "P-256") {
    throw new Error("Neon service JWT key must be an EC P-256 key");
  }
  return {
    ...jwk,
    kid: process.env.NEON_SERVICE_JWT_KID || DEFAULT_KID,
    use: "sig",
    alg: "ES256",
    key_ops: ["verify"],
  };
}

function createNeonJwt(role: "authenticated" | "service_role", subject: string, now = Date.now()): string {
  const key = getPrivateKey();
  const issuedAt = Math.floor(now / 1000);
  const configuredTtl = Number(process.env.NEON_SERVICE_JWT_TTL_SECONDS);
  const ttl = Number.isFinite(configuredTtl)
    ? Math.min(Math.max(Math.floor(configuredTtl), 60), 600)
    : DEFAULT_TTL_SECONDS;
  const kid = process.env.NEON_SERVICE_JWT_KID || DEFAULT_KID;
  const audience = process.env.NEON_DATA_API_JWT_AUDIENCE || DEFAULT_AUDIENCE;
  const issuer = process.env.NEON_SERVICE_JWT_ISSUER || "anclora-advisor-ai";

  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid, typ: "JWT" })).toString(
    "base64url"
  );
  const payload = Buffer.from(
    JSON.stringify({
      aud: audience,
      exp: issuedAt + ttl,
      iat: issuedAt,
      iss: issuer,
      role,
      sub: subject,
    })
  ).toString("base64url");
  const signingInput = `${header}.${payload}`;
  const signature = sign("sha256", Buffer.from(signingInput), {
    key,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");

  return `${signingInput}.${signature}`;
}

export function createNeonServiceJwt(now = Date.now()): string {
  return createNeonJwt("service_role", "advisor-service", now);
}

export function createNeonUserJwt(userId: string, now = Date.now()): string {
  if (!userId) throw new Error("A mapped Advisor user ID is required for an authenticated Neon JWT");
  return createNeonJwt("authenticated", userId, now);
}
