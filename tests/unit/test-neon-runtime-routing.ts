import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { getRagDatabaseClient } from "../../src/lib/rag/retrieval";

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;

function restoreEnvironment(): void {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
  globalThis.fetch = originalFetch;
}

async function main(): Promise<void> {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  process.env.NEON_DATA_API_URL = "https://neon.example.test/neondb/rest/v1";
  process.env.NEON_SERVICE_JWT_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

  let requestedUrl = "";
  let requestedAuthorization = "";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    requestedAuthorization = new Headers(init?.headers).get("authorization") ?? "";
    return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;

  try {
    const client = getRagDatabaseClient();
    const { error } = await client.from("users").select("id");
    assert.equal(error, null, "Neon database request succeeds");
    assert.match(requestedUrl, /^https:\/\/neon\.example\.test\/neondb\/rest\/v1\/users/);
    assert.match(requestedAuthorization, /^Bearer /);
    const payload = JSON.parse(Buffer.from(requestedAuthorization.split(".")[1], "base64url").toString());
    assert.equal(payload.role, "service_role");
  } finally {
    restoreEnvironment();
  }
}

void main().then(() => console.log("Neon runtime routing: PASS"));
