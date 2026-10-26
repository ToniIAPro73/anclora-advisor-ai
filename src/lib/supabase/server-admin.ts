import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getDatabaseApiUrl,
  getDatabaseProvider,
  getSupabaseAnonKey,
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
  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    ...(provider === "neon"
      ? { global: { headers: { Authorization: `Bearer ${createNeonServiceJwt()}` } } }
      : {}),
  };

  const apiKey = provider === "neon" ? getSupabaseAnonKey() : getServiceRoleKey();
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
