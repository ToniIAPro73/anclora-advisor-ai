import "server-only";
import { NeonPostgrestClient } from "@neondatabase/postgrest-js";
import { getDatabaseApiUrl } from "@/lib/env";
import { createNeonServiceJwt } from "@/lib/neon/service-jwt";

export function createNeonServiceClient() {
  const token = createNeonServiceJwt();
  return new NeonPostgrestClient({
    dataApiUrl: getDatabaseApiUrl(),
    options: { global: { fetch: globalThis.fetch.bind(globalThis), headers: { Authorization: `Bearer ${token}` } } },
  });
}
