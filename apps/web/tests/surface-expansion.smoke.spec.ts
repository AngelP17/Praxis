import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
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
});

test("expanded platform surfaces render core content", async ({ page }) => {
  await page.goto("/platform", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Observability and SRE Control Plane")).toBeVisible({ timeout: 30_000 });

  await page.goto("/decision-center", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Astraea Decisioning and Human Overrides")).toBeVisible({ timeout: 30_000 });

  await page.goto("/assets", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Infrastructure Inventory and Criticality Map")).toBeVisible({ timeout: 30_000 });

  await page.goto("/audit", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Compliance and Forensic Event Ledger")).toBeVisible({ timeout: 30_000 });

  await page.goto("/recommendations", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Intelligent Automation Queue")).toBeVisible({ timeout: 30_000 });

  await page.goto("/event-ingestion", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Real-time Signal Intake")).toBeVisible({ timeout: 30_000 });

  await page.goto("/incidents/IR-2026-041", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Timeline Reconstruction", { exact: true })).toBeVisible({ timeout: 30_000 });
});
