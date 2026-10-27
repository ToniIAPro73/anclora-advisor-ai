import { loadEnvConfig } from "@next/env";
import { createNeonServiceClient } from "../src/lib/neon/server-admin";
import { normalizeAppRole } from "../src/lib/auth/roles";

loadEnvConfig(process.cwd());

type LegacyUser = { email: string; role: string | null; is_active: boolean | null };

async function main() {
  const apply = process.argv.includes("--apply");
  const issuer = process.env.ANCLORA_IDENTITY_ISSUER_URL?.replace(/\/$/, "");
  const roleAdminToken = process.env.ANCLORA_IDENTITY_ROLE_ADMIN_TOKEN;
  if (apply && (!issuer || !roleAdminToken)) {
    throw new Error("Set ANCLORA_IDENTITY_ISSUER_URL and ANCLORA_IDENTITY_ROLE_ADMIN_TOKEN in the protected local environment before applying roles");
  }

  const database = createNeonServiceClient();
  const { data, error } = await database.from("users").select("email,role,is_active").order("email");
  if (error) throw new Error(`Unable to read Advisor role source: ${error.message}`);

  const activeUsers = ((data ?? []) as LegacyUser[]).filter((user) => user.is_active !== false && user.email.trim());
  const counts = { admin: 0, partner: 0, user: 0 };
  for (const user of activeUsers) {
    const role = normalizeAppRole(user.role);
    counts[role] += 1;
    if (!apply) continue;

    const response = await fetch(`${issuer!}/api/v1/admin/apps/anclora-advisor-ai/roles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${roleAdminToken!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email.trim().toLowerCase(), role }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      console.error(`Role not migrated (${response.status}): ${body.error ?? "IDENTITY_ROLE_UPDATE_FAILED"}`);
    }
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", activeUsers: activeUsers.length, roleCounts: counts }, null, 2));
  if (!apply) console.log("No Identity roles were changed. Re-run with --apply only after memberships are provisioned and reviewed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Advisor role migration failed");
  process.exitCode = 1;
});
