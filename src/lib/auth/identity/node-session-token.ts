import { createHmac, timingSafeEqual } from "node:crypto";
import { getAdvisorIdentityConfig } from "./env";
import type { AdvisorIdentitySession } from "./session-token";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export function readAdvisorIdentitySessionSync(token: string): AdvisorIdentitySession | null {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return null;
  try {
    const { sessionSecret } = getAdvisorIdentityConfig();
    const expected = createHmac("sha256", sessionSecret).update(body).digest();
    const received = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdvisorIdentitySession;
    if (!session.exp || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function getIdentitySessionFromRequestCookieHeader(cookieHeader: string | null): AdvisorIdentitySession | null {
  const value = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`))?.slice(SESSION_COOKIE_NAME.length + 1);
  return value ? readAdvisorIdentitySessionSync(decodeURIComponent(value)) : null;
}
