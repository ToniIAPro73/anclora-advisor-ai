export function getDatabaseProvider(): "neon" {
  return "neon";
}

export function getDatabaseApiUrl(): string {
  const value = process.env.NEON_DATA_API_URL?.trim();
  if (!value) throw new Error("Missing required environment variable: NEON_DATA_API_URL");
  return value.replace(/\/$/, "");
}
