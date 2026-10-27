import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { isAdminRole } from "@/lib/auth/roles";
import { decodeIdentityCookie, type AdvisorIdentitySession } from "@/lib/auth/identity/session-token";

function buildRedirect(request: NextRequest, pathname: string, next?: string) {
  const url = new URL(pathname, request.url);
  if (next) {
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isLoginRoute = pathname === "/login";

  if (!isDashboardRoute && !isLoginRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!accessToken) {
    if (isDashboardRoute) {
      const next = `${pathname}${search}`;
      return buildRedirect(request, "/login", next);
    }
    return NextResponse.next();
  }

  const sessionSecret = process.env.ANCLORA_IDENTITY_SESSION_SECRET ?? "";
  const identitySession = await decodeIdentityCookie<AdvisorIdentitySession>(sessionSecret, accessToken);
  if (!identitySession) {
    if (isDashboardRoute) {
      const next = `${pathname}${search}`;
      return buildRedirect(request, "/login", next);
    }
    return NextResponse.next();
  }

  if (isLoginRoute) return buildRedirect(request, "/dashboard/chat");
  if (isAdminRoute && !isAdminRole(identitySession.role)) return buildRedirect(request, "/dashboard/chat");

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
