import { expect, test } from "playwright/test";

test("landing portfolio analytics is fed by proof artifacts and is interactive", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Portfolio analytics").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Verified annual value by scenario pack").first()).toBeVisible();
  await expect(page.getByText("Decision signal decomposition").first()).toBeVisible();

  const analyticsSection = page.locator("section", { hasText: "Portfolio analytics" }).first();
  await expect(analyticsSection.locator("svg.recharts-surface").first()).toBeVisible({ timeout: 15_000 });
  await expect(analyticsSection.locator(".recharts-bar-rectangle")).toHaveCount(4);

  // Switching packs swaps in that pack's real deterministic values
  await analyticsSection.getByRole("button", { name: /Network Edge Failover/ }).click();
  await expect(page.getByText("priority 58%").first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("8 raw events scored deterministically").first()).toBeVisible();

  await analyticsSection.getByRole("button", { name: /Database Replication Lag/ }).click();
  await expect(page.getByText("priority 77%").first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("12 raw events scored deterministically").first()).toBeVisible();
});

test("landing scenario simulation is fed by the generated scenario registry", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const simulationSection = page.locator("section", { hasText: "Scenario swarm" }).first();
  await expect(simulationSection).toBeVisible({ timeout: 30_000 });
  await expect(simulationSection.getByRole("button")).toHaveCount(4);

  await simulationSection.getByRole("button", { name: /Database Replication Lag/ }).click();
  await expect(simulationSection.getByText("PostgreSQL database replication lag alert")).toBeVisible();
  await expect(simulationSection.getByText("$110.0K")).toBeVisible();
  await expect(simulationSection.getByText("database-failover-lag · generated registry")).toBeVisible();
  await expect(simulationSection.getByRole("link", { name: /Open scenario/ })).toHaveAttribute(
    "href",
    "/field-workbench?pack=database-failover-lag",
  );
});
