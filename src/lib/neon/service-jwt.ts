import { createPrivateKey, createPublicKey, sign } from "node:crypto";

const DEFAULT_KID = "anclora-advisor-neon-service-v1";
const DEFAULT_AUDIENCE = "authenticated";
const DEFAULT_TTL_SECONDS = 300;

function getPrivateKey() {
  const value = process.env.NEON_SERVICE_JWT_PRIVATE_KEY;
  if (!value) {
    throw new Error("Missing required environment variable: NEON_SERVICE_JWT_PRIVATE_KEY");
  }

  return createPrivateKey(value.replace(/\\n/g, "\n"));
}

export function getNeonServiceJwk() {
  const jwk = createPublicKey(getPrivateKey()).export({ format: "jwk" });
  return {
    ...jwk,
    kid: process.env.NEON_SERVICE_JWT_KID || DEFAULT_KID,
    use: "sig",
    alg: "ES256",
    key_ops: ["verify"],
  };
}

export function createNeonServiceJwt(now = Date.now()): string {
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
      role: "service_role",
      sub: "advisor-service",
    })
  ).toString("base64url");
  const signingInput = `${header}.${payload}`;
  const signature = sign("sha256", Buffer.from(signingInput), {
    key,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");

  return `${signingInput}.${signature}`;
}
