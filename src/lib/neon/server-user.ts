import { NeonPostgrestClient } from "@neondatabase/postgrest-js";
import { getDatabaseApiUrl } from "@/lib/env";
import { createNeonUserJwt } from "@/lib/neon/service-jwt";
import { readAdvisorIdentitySessionSync } from "@/lib/auth/identity/node-session-token";

export function createNeonUserClient(identitySessionToken: string) {
  const session = readAdvisorIdentitySessionSync(identitySessionToken);
  if (!session) throw new Error("Invalid Anclora Identity session");
  const token = createNeonUserJwt(session.userId);
  return new NeonPostgrestClient({
    dataApiUrl: getDatabaseApiUrl(),
    options: { global: { fetch: globalThis.fetch.bind(globalThis), headers: { Authorization: `Bearer ${token}` } } },
  });
}
