/**
 * env.ts - Acceso seguro a variables de entorno.
 *
 * IMPORTANTE (Next.js + Webpack):
 * Las variables NEXT_PUBLIC_* deben leerse con su nombre LITERAL
 * (e.g. process.env.NEXT_PUBLIC_SUPABASE_URL), ya que Webpack hace
 * reemplazo estático en build time. El acceso dinámico process.env[name]
 * solo funciona en el servidor Node.js, no en el bundle del browser.
 */

// ─── Cliente (browser-safe) ───────────────────────────────────────────────────

export function getPublicSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  return value;
}

export function getPublicSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return value;
}

/** Valida que las variables públicas estén disponibles en el cliente. */
export function validatePublicEnv(): void {
  getPublicSupabaseUrl();
  getPublicSupabaseAnonKey();
}

// ─── Servidor (server-only, fallback a NEXT_PUBLIC si no hay var de servidor) ──

export function getSupabaseUrl(): string {
  // En servidor usa SUPABASE_URL si existe; en cliente usa NEXT_PUBLIC_*
  return process.env.SUPABASE_URL ?? getPublicSupabaseUrl();
}

export function getSupabaseAnonKey(): string {
  // SUPABASE_KEY es alias server-side de la anon key si se define
  return process.env.SUPABASE_KEY ?? getPublicSupabaseAnonKey();
}

export type DatabaseProvider = "supabase" | "neon";

export function getDatabaseProvider(): DatabaseProvider {
  const value = process.env.DATABASE_PROVIDER ?? "supabase";
  if (value !== "supabase" && value !== "neon") {
    throw new Error(`Unsupported DATABASE_PROVIDER: ${value}`);
  }
  return value;
}

/** REST-compatible database endpoint; Supabase remains the auth/storage endpoint. */
export function getDatabaseApiUrl(): string {
  if (getDatabaseProvider() === "supabase") {
    return getSupabaseUrl();
  }

  const value = process.env.NEON_DATA_API_URL;
  if (!value) {
    throw new Error("DATABASE_PROVIDER=neon requires NEON_DATA_API_URL");
  }
  return value;
}
