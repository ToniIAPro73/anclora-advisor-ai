import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getDatabaseApiUrl,
  getDatabaseProvider,
  getSupabaseUrl,
} from "@/lib/env";
import { createNeonServiceJwt } from "@/lib/neon/service-jwt";

function getServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }
  return value;
}

export function createServiceSupabaseClient(): SupabaseClient {
  const provider = getDatabaseProvider();
  const neon = provider === "neon";
  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    ...(neon
      ? {
          global: {
            headers: { Authorization: `Bearer ${createNeonServiceJwt()}` },
            fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
              const headers = new Headers(init?.headers);
              // Neon Data API authorizes the bearer JWT; a Supabase apikey is not used.
              headers.delete("apikey");
              return fetch(input, { ...init, headers });
            },
          },
        }
      : {}),
  };

  const apiKey = neon ? "neon-data-api" : getServiceRoleKey();
  return createClient(getDatabaseApiUrl(), apiKey, options);
}

/** Supabase Auth/Storage admin access remains separate from the database provider. */
export function createSupabaseStorageAdminClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
