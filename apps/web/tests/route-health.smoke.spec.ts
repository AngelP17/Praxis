import { expect, test } from "playwright/test";

/**
 * Whole-app health gate: every shipped route must render without console
 * errors, page errors, failed API responses, or dead-end placeholder text.
 * This is the "nothing on any surface is silently broken" guarantee.
 */

const ROUTES = [
  "/",
  "/login",
  "/why-praxis",
  "/dashboard",
  "/command-center",
  "/console",
  "/platform",
  "/incidents",
  "/incidents/IR-2026-041",
  "/recommendations",
  "/event-ingestion",
  "/board",
  "/tickets/new",
  "/tickets/INC-4821",
  "/assets",
  "/audit",
  "/reports",
  "/admin",
  "/replay/INC-4821",
  "/field-workbench",
  "/solution-packs",
  "/ontology",
  "/decision",
  "/decision-center",
  "/discovery",
  "/value-case",
  "/expansion-map",
  "/executive-readout",
  "/proof/fieldlab_run_manufacturing_printer_gpo",
  "/proof/diff",
  "/executive-readout/fieldlab_run_manufacturing_printer_gpo",
];

const DEAD_TEXT = [
  "Live data did not load",
  "No decision record available",
  "Backend unavailable",
  "[object Object]",
  "undefined undefined",
];

test("every shipped route renders healthy in demo mode", async ({ page }) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => {
    window.localStorage.setItem("access_token", "demo-local-token");
    window.localStorage.setItem(
      "user",
      JSON.stringify({ username: "operator", role: "agent", display_name: "Demo Operator" }),
    );
  });

  const failures: string[] = [];
  for (const route of ROUTES) {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const badResponses: string[] = [];
    const onConsole = (msg: { type: () => string; text: () => string }) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 120));
    };
    const onPageError = (err: unknown) => pageErrors.push(String(err).slice(0, 120));
    const onResponse = (res: { status: () => number; url: () => string }) => {
      const url = res.url();
      if (res.status() >= 400 && !url.includes("favicon") && !url.includes("_next/")) {
        badResponses.push(`${res.status()} ${url}`);
      }
    };
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    page.on("response", onResponse);

    await page.goto(route, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(900);
    const body = (await page.locator("body").innerText().catch(() => "")) || "";

    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("response", onResponse);

    const issues: string[] = [];
    if (pageErrors.length) issues.push(`page errors: ${pageErrors.join("; ")}`);
    if (consoleErrors.length) issues.push(`console errors: ${consoleErrors.slice(0, 2).join("; ")}`);
    if (badResponses.length) issues.push(`failed requests: ${[...new Set(badResponses)].slice(0, 3).join("; ")}`);
    const dead = DEAD_TEXT.filter((t) => body.includes(t));
    if (dead.length) issues.push(`dead text: ${dead.join(", ")}`);
    if (body.trim().length < 40) issues.push("nearly empty page");
    if (issues.length) failures.push(`${route} -> ${issues.join(" | ")}`);
  }

  expect(failures, failures.join("\n")).toEqual([]);
});
