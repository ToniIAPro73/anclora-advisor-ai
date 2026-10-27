import { createClient, type User } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
import { isAncloraIdentityEnabled } from "@/lib/auth/identity/env";
import { readAdvisorIdentitySession } from "@/lib/auth/identity/session";

export function createSupabaseServerClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function validateAccessToken(
  accessToken: string
): Promise<{ user: User | null; error: string | null }> {
  if (isAncloraIdentityEnabled()) {
    const session = await readAdvisorIdentitySession(accessToken);
    if (!session) return { user: null, error: "Invalid Anclora Identity session" };
    return {
      user: {
        id: session.userId,
        email: session.email,
        user_metadata: { full_name: session.fullName, identity_sub: session.sub },
        app_metadata: { provider: "anclora-identity", application_role: session.role },
      } as unknown as User,
      error: null,
    };
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return { user: null, error: error?.message ?? "Invalid session token" };
  }

  return { user: data.user, error: null };
}

