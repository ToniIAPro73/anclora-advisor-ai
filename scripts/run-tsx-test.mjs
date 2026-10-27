import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const shim = fileURLToPath(new URL("../tests/server-only-test-shim.cjs", import.meta.url));
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/run-tsx-test.mjs <test-file> [args...]");
  process.exit(2);
}

const result = spawnSync(process.execPath, ["--import=tsx", "--require", shim, ...args], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env,
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
