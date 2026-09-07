import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function isGoogleAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';
}

export function isGithubAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_GITHUB_AUTH === 'true';
}

export async function signInWithOAuth(provider: 'google' | 'github', redirectTo?: string) {
  const client = getSupabaseBrowserClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirect = redirectTo || `${origin}/auth/callback`;
  return client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirect,
    },
  });
}
