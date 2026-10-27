const SESSION_TTL_SECONDS = 60 * 60 * 8;
const STATE_TTL_SECONDS = 60 * 10;

export const ADVISOR_IDENTITY_STATE_COOKIE = "anclora-advisor-identity-state";

export interface AdvisorIdentitySession {
  sub: string;
  userId: string;
  email: string;
  fullName: string;
  role: "admin" | "partner" | "user";
  exp: number;
}

export interface AdvisorOidcState {
  state: string;
  codeVerifier: string;
  next: string;
  exp: number;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function encodeIdentityCookie<T extends object>(secret: string, payload: T): Promise<string> {
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(body));
  return `${body}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function decodeIdentityCookie<T extends { exp: number }>(secret: string, token?: string | null): Promise<T | null> {
  if (!token) return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(secret), base64UrlDecode(signature), new TextEncoder().encode(body));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as T;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

export function createIdentitySessionPayload(input: Omit<AdvisorIdentitySession, "exp">): AdvisorIdentitySession {
  return { ...input, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
}

export function createOidcStatePayload(input: Omit<AdvisorOidcState, "exp">): AdvisorOidcState {
  return { ...input, exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS };
}

export { SESSION_TTL_SECONDS, STATE_TTL_SECONDS };
