import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("praxis-demo-journey-seeded")) {
      window.localStorage.removeItem("praxis-demo-session-v1");
      window.sessionStorage.setItem("praxis-demo-journey-seeded", "1");
    }
    window.localStorage.setItem("access_token", "demo-local-token");
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        username: "operator",
        role: "agent",
        display_name: "Demo Operator",
      }),
    );
  });
});

test("demo visitor can create, approve, audit, run, export, and reset", async ({ page, request }) => {
  await page.goto("/tickets/new", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Create a new operational ticket").first()).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: /Create ticket/ }).click();
  await expect(page.getByText("Title is required")).toBeVisible({ timeout: 15_000 });

  const demoTitle = "Demo session conveyor telemetry drift";
  await page.getByLabel("Title").fill(demoTitle);
  await page.getByLabel("Requester").fill("demo.plant.operator");
  await page.getByLabel("Priority").selectOption("High");
  await page.getByLabel("Category").selectOption({ label: "Mechanical" });
  await page.getByLabel("Assignee").selectOption("M. Santos");
  await page.getByLabel("Site / Asset Context").fill("Plant-A / Conveyor Line 7");
  await page.getByLabel("Description").fill("Conveyor line 7 telemetry is drifting outside normal tolerance during shift change.");
  await page.getByLabel("Resolution notes").fill("Review sensor calibration, attach evidence, and route to mechanical owner.");
  await page.getByRole("button", { name: /Create ticket/ }).click();

  await expect(page).toHaveURL(/\/tickets\/INC-DEMO-001$/);
  await expect(page.getByText("INC-DEMO-001").first()).toBeVisible({ timeout: 30_000 });
  const storedDemoSession = await page.evaluate(() => window.localStorage.getItem("praxis-demo-session-v1") ?? "");
  expect(storedDemoSession).toContain(demoTitle);

  await page.goto("/command-center", { waitUntil: "domcontentloaded" });
  const storedAfterNavigation = await page.evaluate(() => window.localStorage.getItem("praxis-demo-session-v1") ?? "");
  expect(storedAfterNavigation).toContain(demoTitle);
  await expect(page.getByText("Signal Queue").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(demoTitle).first()).toBeVisible();

  await page.goto("/decision-center", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Praxis Operational Decisions and Replay Proof")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("Decision approved.")).toBeVisible();

  await page.goto("/audit", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Compliance and Forensic Event Ledger")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("decision.approved").first()).toBeVisible();
  await expect(page.getByText("ticket.create").first()).toBeVisible();

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Demo session").first()).toBeVisible({ timeout: 30_000 });
  await page.locator("section", { hasText: "Scenario swarm" }).getByRole("button", { name: /Network Edge Failover/ }).click();
  await page.getByRole("link", { name: /Open scenario/ }).click();
  await expect(page).toHaveURL(/\/field-workbench\?pack=network-edge-failover/);
  await expect(page.getByText("Network Edge Failover").first()).toBeVisible({ timeout: 30_000 });

  const proofResponse = await request.get("/api/proofs/network-edge-failover");
  expect(proofResponse.ok()).toBeTruthy();
  const proof = await proofResponse.json();
  expect(proof.solution_pack).toBe("network-edge-failover");
  expect(proof.proof_hash).toContain("sha256:");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.goto("/command-center", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(demoTitle)).toHaveCount(0);
});
