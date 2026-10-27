import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit/logs";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { createNeonServiceClient } from "@/lib/neon/server-admin";
import { clearAdvisorIdentitySession, getAdvisorIdentitySession } from "@/lib/auth/identity/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdvisorIdentitySession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      user_metadata: { full_name: session.fullName },
      app_metadata: { provider: "anclora-identity", application_role: session.role },
    },
  }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function DELETE() {
  const session = await getAdvisorIdentitySession();
  await clearAdvisorIdentitySession();
  if (session) {
    try {
      await createAuditLog(createNeonServiceClient(), {
        userId: session.userId,
        domain: "admin_rag",
        entityType: "auth_session",
        entityId: session.userId,
        action: "session_ended",
        summary: `Sesion Identity cerrada para ${session.email}`,
      });
    } catch {
      // Logout remains available when audit logging is unavailable.
    }
  }
  const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
