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

test("runs printer GPO drift from event intake to proof export", async ({ page }) => {
  // 1. Open Field Workbench with the manufacturing printer pack loaded
  await page.goto("/field-workbench?pack=manufacturing-printer-gpo", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Operational Overview").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Manufacturing Printer Deployment Failure").first()).toBeVisible({ timeout: 30_000 });

  // 2. Event intake and run posture render on the workbench rail
  await expect(page.getByText("Mission Readiness").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Active Operations").first()).toBeVisible();
  await expect(page.getByText("Signal Quality").first()).toBeVisible();
  await expect(page.getByText("Annual value").first()).toBeVisible();
  await expect(page.getByText("Proof hash").first()).toBeVisible();

  // 3. The deterministic proof hash for the flagship run is surfaced
  await expect(page.getByText("db06e81f").first()).toBeVisible({ timeout: 30_000 });

  // 4. The proof journey narrates intake -> decision -> approval
  await expect(page.getByText("Signals captured").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Decision generated").first()).toBeVisible();
  await expect(page.getByText("Action gated").first()).toBeVisible();
  await expect(page.getByText("human_approval").first()).toBeVisible();

  // 5. Open the proof detail surface for the flagship run
  await page.goto("/proof/fieldlab_run_manufacturing_printer_gpo?pack=manufacturing-printer-gpo", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByText("Proof Control").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Active proof controls").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/uvx praxis-verify/).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Check Replay Determinism").first()).toBeVisible();

  // 6. Decision evidence, priority, and conformance are reported
  await expect(page.getByText("Evidence trust").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("83%").first()).toBeVisible();
  await expect(page.getByText("Priority").first()).toBeVisible();
  await expect(page.getByText("L0 verified").first()).toBeVisible();
  await expect(page.getByText(/printer[ _]deployment[ _]policy[ _]drift/i).first()).toBeVisible({ timeout: 30_000 });

  // 7. Human approval gate is captured in the journey and the proof is exportable
  await expect(page.getByText("human_approval").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("JSON export").first()).toBeVisible();

  // 8. Dashboard reflects live, snapshot, or stale-but-known state
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Portfolio Dashboard").first()).toBeVisible({ timeout: 30_000 });
  const liveCount = await page.getByText("Live data active").count();
  const snapshotCount = await page.getByText("operations snapshot").count();
  const staleCount = await page.getByText("Stale data with last known records").count();
  const nominalCount = await page.getByText(/live metrics nominal|sites live/).count();
  expect(liveCount + snapshotCount + staleCount + nominalCount).toBeGreaterThan(0);

  // 9. Audit ledger exposes the export affordance
  await page.goto("/audit", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Compliance and Forensic Event Ledger").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Export").first()).toBeVisible({ timeout: 30_000 });

  // 10. No dead error walls anywhere on the final surface
  await expect(page.getByText("Live data did not load")).toHaveCount(0);
  await expect(page.getByText("0 visible")).toHaveCount(0);
  await expect(page.getByText("No decision record available")).toHaveCount(0);
});
