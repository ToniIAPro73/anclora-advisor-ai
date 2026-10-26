import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { getRagDatabaseClient } from "../../src/lib/rag/retrieval";
import { createServiceSupabaseClient } from "../../src/lib/supabase/server-admin";
import { createUserScopedSupabaseClient } from "../../src/lib/supabase/server-user";

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
  process.env.DATABASE_PROVIDER = "neon";
  process.env.NEON_DATA_API_URL = "https://neon.example.test/neondb/rest/v1";
  process.env.NEON_SERVICE_JWT_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  process.env.SUPABASE_URL = "https://auth-and-storage.example.test";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://auth-and-storage.example.test";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-test-key";
  process.env.SUPABASE_KEY = "public-test-key";

  let requestedUrl = "";
  let requestedAuthorization = "";
  let requestedApiKey: string | null = null;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    const headers = new Headers(init?.headers);
    requestedAuthorization = headers.get("authorization") ?? "";
    requestedApiKey = headers.get("apikey");
    return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;

  try {
    const client = getRagDatabaseClient();
    const { error } = await client.from("users").select("id");
    assert.equal(error, null, "Neon database request succeeds");
    assert.match(requestedUrl, /^https:\/\/neon\.example\.test\/neondb\/rest\/v1\/users/);
    assert.match(requestedAuthorization, /^Bearer /);
    assert.equal(requestedApiKey, null, "Neon requests do not send the Supabase apikey header");
    const payload = JSON.parse(Buffer.from(requestedAuthorization.split(".")[1], "base64url").toString());
    assert.equal(payload.role, "service_role", "Neon service JWT selects the service role");

    const userClient = createUserScopedSupabaseClient("supabase-user-jwt");
    const { error: userError } = await userClient.from("users").select("id");
    assert.equal(userError, null, "User-scoped Neon request succeeds");
    assert.equal(requestedAuthorization, "Bearer supabase-user-jwt");
    assert.equal(requestedApiKey, null, "User-scoped Neon request omits the Supabase apikey");

    process.env.DATABASE_PROVIDER = "supabase";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-test-key";
    const supabaseClient = createServiceSupabaseClient();
    const { error: rollbackError } = await supabaseClient.from("users").select("id");
    assert.equal(rollbackError, null, "Supabase rollback provider request succeeds");
    assert.match(requestedUrl, /^https:\/\/auth-and-storage\.example\.test\/rest\/v1\/users/);
    assert.equal(requestedAuthorization, "Bearer service-test-key");
  } finally {
    restoreEnvironment();
  }
}

void main().then(() => console.log("Neon runtime routing: PASS"));
