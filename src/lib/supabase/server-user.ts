import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getDatabaseApiUrl, getDatabaseProvider, getSupabaseAnonKey } from "@/lib/env";
import { isAncloraIdentityEnabled } from "@/lib/auth/identity/env";
import { readAdvisorIdentitySessionSync } from "@/lib/auth/identity/node-session-token";
import { createNeonUserJwt } from "@/lib/neon/service-jwt";

export function createUserScopedSupabaseClient(accessToken: string): SupabaseClient {
  const neon = getDatabaseProvider() === "neon";
  let bearerToken = accessToken;
  if (isAncloraIdentityEnabled()) {
    if (!neon) throw new Error("Anclora Identity sessions require DATABASE_PROVIDER=neon");
    const session = readAdvisorIdentitySessionSync(accessToken);
    if (!session) throw new Error("Invalid Anclora Identity session");
    bearerToken = createNeonUserJwt(session.userId);
  }
  return createClient(getDatabaseApiUrl(), neon ? "neon-data-api" : getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      ...(neon
        ? {
            fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
              const headers = new Headers(init?.headers);
              headers.delete("apikey");
              return fetch(input, { ...init, headers });
            },
          }
        : {}),
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

