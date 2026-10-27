export function normalizeNextPath(value: string | null | undefined, fallback = "/dashboard/chat"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const parsed = new URL(value, "https://advisor.invalid");
    return parsed.origin === "https://advisor.invalid" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}
