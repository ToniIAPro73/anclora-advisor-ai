import { expect, test } from "@playwright/test";

test.describe("Supabase OAuth contract", () => {
  test("login screen keeps social providers disabled when flags are absent", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "GitHub" })).toBeDisabled();
  });
});
