import { cookies } from "next/headers";
import { getAdvisorIdentityConfig } from "./env";
import { ADVISOR_IDENTITY_STATE_COOKIE, decodeIdentityCookie, encodeIdentityCookie, type AdvisorIdentitySession, type AdvisorOidcState, SESSION_TTL_SECONDS, STATE_TTL_SECONDS } from "./session-token";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function readAdvisorIdentitySession(token?: string | null): Promise<AdvisorIdentitySession | null> {
  const { sessionSecret } = getAdvisorIdentityConfig();
  return decodeIdentityCookie<AdvisorIdentitySession>(sessionSecret, token);
}

export async function getAdvisorIdentitySession(): Promise<AdvisorIdentitySession | null> {
  const store = await cookies();
  return readAdvisorIdentitySession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function createAdvisorIdentitySession(session: Omit<AdvisorIdentitySession, "exp">): Promise<void> {
  const { sessionSecret } = getAdvisorIdentityConfig();
  const store = await cookies();
  const value = await encodeIdentityCookie(sessionSecret, { ...session, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
  store.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdvisorIdentitySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0, expires: new Date(0) });
}

export async function storeAdvisorOidcState(input: Omit<AdvisorOidcState, "exp">): Promise<void> {
  const { sessionSecret } = getAdvisorIdentityConfig();
  const store = await cookies();
  const value = await encodeIdentityCookie(sessionSecret, { ...input, exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS });
  store.set(ADVISOR_IDENTITY_STATE_COOKIE, value, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: STATE_TTL_SECONDS });
}

export async function consumeAdvisorOidcState(): Promise<AdvisorOidcState | null> {
  const { sessionSecret } = getAdvisorIdentityConfig();
  const store = await cookies();
  const token = store.get(ADVISOR_IDENTITY_STATE_COOKIE)?.value;
  store.set(ADVISOR_IDENTITY_STATE_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0, expires: new Date(0) });
  return decodeIdentityCookie<AdvisorOidcState>(sessionSecret, token);
}
