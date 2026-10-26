import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getDatabaseApiUrl, getDatabaseProvider, getSupabaseAnonKey } from "@/lib/env";

export function createUserScopedSupabaseClient(accessToken: string): SupabaseClient {
  const neon = getDatabaseProvider() === "neon";
  return createClient(getDatabaseApiUrl(), neon ? "neon-data-api" : getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

