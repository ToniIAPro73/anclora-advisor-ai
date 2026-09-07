import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Reject backslashes as well as protocol-relative paths; URL normalization can
  // otherwise turn a value such as "/\\\\attacker.example" into an external URL.
  const safeNext = (next.startsWith('/') && !next.startsWith('//') && !next.includes('\\'))
    ? next
    : '/dashboard';
  const response = NextResponse.redirect(new URL(safeNext, request.url));

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseAnonKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.access_token) {
        response.cookies.set(SESSION_COOKIE_NAME, data.session.access_token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        if (data.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const { syncAppUserRecord } = await import('@/lib/auth/app-user');
            await syncAppUserRecord(data.user);
          } catch (syncErr) {
            console.warn('[auth/callback] User record sync skipped/failed:', syncErr);
          }
        }
      }
    }
  }

  return response;
}
