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
  await expect(page.getByText("Praxis Decisioning and Human Overrides")).toBeVisible({ timeout: 30_000 });

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

test("nav-linked workbench surfaces render without dead error walls", async ({ page }) => {
  const surfaces = [
    { path: "/console", expected: "Operator Console" },
    { path: "/fieldlab", expected: "Live FieldLab proof system" },
    { path: "/solution-packs", expected: "Solution Packs" },
    { path: "/proof/diff", expected: "Proof Diff" },
    { path: "/tickets/new", expected: "New Ticket" },
  ];

  for (const { path, expected } of surfaces) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(expected).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("0 visible")).toHaveCount(0);
    await expect(page.getByText("No decision record available")).toHaveCount(0);
  }
});

test("specialized praxis sub-surfaces render dedicated content", async ({ page }) => {
  const surfaces = [
    { path: "/ontology", expected: "Operational objects, inferred links, and available actions" },
    { path: "/value-case", expected: "Estimated annual value, confidence, and evidence assumptions" },
    { path: "/discovery", expected: "Candidate objects, inferred links, and next questions" },
    { path: "/expansion-map", expected: "Adjacent use cases and expansion potential" },
  ];

  for (const { path, expected } of surfaces) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(expected).first()).toBeVisible({ timeout: 30_000 });
  }
});

test("admin console loads user management in demo mode for admins", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("access_token", "demo-local-token");
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        username: "admin",
        role: "admin",
        display_name: "Admin",
      }),
    );
  });

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("User management")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Create user")).toBeVisible();
  await expect(page.getByText("Category management")).toBeVisible();
});
