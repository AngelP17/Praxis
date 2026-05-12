import { expect, test } from "playwright/test";

test("command center loads operational shell without dead error wall", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("access_token", "demo-local-token");
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        username: "operator",
        role: "agent",
        display_name: "Demo Operator",
      })
    );
  });

  await page.goto("/command-center", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Signal Queue").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Praxis Decision").first()).toBeVisible();
  await expect(page.getByText("INC-4821").first()).toBeVisible();
  await expect(page.getByText("Press Line 3 vibration cascade").first()).toBeVisible();
  await expect(page.getByText("Route to mechanical team and schedule bearing replacement.").first()).toBeVisible();
  await expect(page.getByText("Replay hash chain").first()).toBeVisible();
  await expect(page.getByText("Live data did not load")).toHaveCount(0);
  await expect(page.getByText("0 visible")).toHaveCount(0);
  await expect(page.getByText("No decision record available")).toHaveCount(0);
  const liveCount = await page.getByText("Live data active").count();
  const snapshotCount = await page.getByText("operations snapshot").count();
  const staleCount = await page.getByText("Stale data with last known records").count();
  expect(liveCount + snapshotCount + staleCount).toBeGreaterThan(0);
});
