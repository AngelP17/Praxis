import { expect, test } from "playwright/test";

test("command center loads operational shell without dead error wall", async ({ page }) => {
  await page.goto("/command-center", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Signal Queue").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Astraea Decision").first()).toBeVisible();
  await expect(page.getByText("Live data did not load")).toHaveCount(0);
  await expect(page.getByText("0 visible")).toHaveCount(0);
});
