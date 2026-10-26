import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getDatabaseApiUrl, getSupabaseAnonKey } from "@/lib/env";

export function createUserScopedSupabaseClient(accessToken: string): SupabaseClient {
  return createClient(getDatabaseApiUrl(), getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

