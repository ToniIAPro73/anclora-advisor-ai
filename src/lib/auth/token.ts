import type { IdentityUser } from "@/lib/auth/identity-user";
import { readAdvisorIdentitySession } from "@/lib/auth/identity/session";

export async function validateAccessToken(
  accessToken: string,
): Promise<{ user: IdentityUser | null; error: string | null }> {
  const session = await readAdvisorIdentitySession(accessToken);
  if (!session) return { user: null, error: "Invalid Anclora Identity session" };
  return {
    user: {
      id: session.userId,
      email: session.email,
      user_metadata: { full_name: session.fullName, identity_sub: session.sub },
      app_metadata: { provider: "anclora-identity", application_role: session.role },
    },
    error: null,
  };
}
