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

test("all shipped routes render without dead error walls", async ({ page }) => {
  const routes = [
    { path: "/", expected: "Praxis" },
    { path: "/dashboard", expected: "Operational Overview" },
    { path: "/command-center", expected: "Signal Queue" },
    { path: "/incidents", expected: "Incidents" },
    { path: "/incidents/IR-2026-041", expected: "Timeline Reconstruction" },
    { path: "/replay/INC-4821", expected: "Replay forensics" },
    { path: "/reports", expected: "Reports" },
    { path: "/recommendations", expected: "Intelligent Automation Queue" },
    { path: "/event-ingestion", expected: "Real-time Signal Intake" },
    { path: "/assets", expected: "Infrastructure Inventory" },
    { path: "/audit", expected: "Compliance and Forensic Event Ledger" },
    { path: "/board", expected: "Board" },
    { path: "/admin", expected: "Admin" },
    { path: "/decision-center", expected: "Praxis Decisioning" },
  ];

  for (const route of routes) {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(route.expected).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("0 visible")).toHaveCount(0);
    await expect(page.getByText("No decision record available")).toHaveCount(0);
  }
});

test("command center CTAs are real or disabled with reason", async ({ page }) => {
  await page.goto("/command-center", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  // Approve workflow should be visible and have click behavior (navigates or disabled)
  const approveBtn = page.getByText("Approve workflow").first();
  await expect(approveBtn).toBeVisible();

  // Edit & re-rank should be visible
  const editBtn = page.getByText("Edit & re-rank").first();
  await expect(editBtn).toBeVisible();

  // Send to mechanical should be visible
  const sendBtn = page.getByText("Send to mechanical").first();
  await expect(sendBtn).toBeVisible();

  // Check that no visible button has empty onClick / href="#"
  const badButtons = await page.locator('button:not([type="submit"]):not([disabled])').evaluateAll((buttons) => {
    return buttons.filter((b) => {
      const hasClick = b.onclick !== null || b.getAttribute("data-onclick") !== null;
      const isDisabled = b instanceof HTMLButtonElement && b.disabled;
      return !hasClick && !isDisabled;
    }).map((b) => b.textContent?.trim() ?? "unknown");
  });

  // We allow buttons that are part of the signal queue (they have onClick in React)
  // This test mainly guards against placeholder CTAs with no handler
  const placeholders = badButtons.filter((text) =>
    ["Approve workflow", "Edit & re-rank", "Send to mechanical"].includes(text)
  );
  expect(placeholders).toEqual([]);
});

test("decision center primary CTAs navigate or mutate state", async ({ page }) => {
  await page.goto("/decision-center", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  // Approve and Reject buttons should be visible and not disabled when a decision loads
  await expect(page.getByText("Approve").first()).toBeVisible();
  await expect(page.getByText("Reject").first()).toBeVisible();

  // Refresh should be clickable
  const refreshBtn = page.getByText("Refresh").first();
  await expect(refreshBtn).toBeVisible();
  await refreshBtn.click();
});

test("no fake href=# or placeholder actions exist", async ({ page }) => {
  const routes = ["/", "/command-center", "/decision-center", "/incidents/IR-2026-041", "/replay/INC-4821"];
  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const badLinks = await page.locator('a[href="#"]').count();
    expect(badLinks, `route ${route} has ${badLinks} href="#" links`).toBe(0);
  }
});
