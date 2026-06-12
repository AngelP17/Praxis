import { mkdir, copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(process.cwd(), "apps/web/node_modules/playwright"));

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.resolve(process.cwd(), "docs/demo/screenshots");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture(page, fileName, route, waitForText) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
  if (waitForText) {
    await page.getByText(waitForText, { exact: false }).first().waitFor({ timeout: 35_000 });
  }
  await wait(700);
  await page.screenshot({
    path: path.join(OUT_DIR, fileName),
    fullPage: false,
  });
}

async function loginAsDemoOperator(page) {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.getByText("Sign In", { exact: false }).first().waitFor({ timeout: 15_000 });
    await page.getByLabel("Username").fill("operator");
    await page.getByLabel("Password").fill("operator");
    await page.getByRole("button", { name: /Open Command Center/i }).click();
    await page.waitForURL(/\/command-center/, { timeout: 15_000 });
    await page.getByText("Signal Queue").first().waitFor({ timeout: 15_000 });
    return;
  } catch {
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
    await page.goto(`${BASE_URL}/command-center`, { waitUntil: "domcontentloaded" });
    await page.getByText("Signal Queue").first().waitFor({ timeout: 30_000 });
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const publicContext = await browser.newContext({
    viewport: { width: 1600, height: 980 },
    deviceScaleFactor: 2,
  });
  const publicPage = await publicContext.newPage();

  const authContext = await browser.newContext({
    viewport: { width: 1600, height: 980 },
    deviceScaleFactor: 2,
  });
  const authPage = await authContext.newPage();

  try {
    await capture(publicPage, "01-homepage.png", "/", "Proof the full stack.");
    await capture(publicPage, "02-login.png", "/login", "Sign In");

    await loginAsDemoOperator(authPage);
    await capture(authPage, "03-command-center-live.png", "/command-center", "Signal Queue");
    await copyFile(path.join(OUT_DIR, "03-command-center-live.png"), path.join(OUT_DIR, "03-command-center.png"));

    await authPage.getByText("Selected incident").first().waitFor({ timeout: 20_000 });
    await authPage.getByText("Replay hash chain").first().waitFor({ timeout: 20_000 });
    await wait(600);
    await authPage.screenshot({ path: path.join(OUT_DIR, "04-decision-explanation.png"), fullPage: false });

    await authPage.evaluate(() => {
      window.scrollTo({ top: 900, behavior: "auto" });
    });
    await wait(900);
    await authPage.screenshot({ path: path.join(OUT_DIR, "06-platform-evidence.png"), fullPage: false });

    await capture(authPage, "05-replay-timeline.png", "/replay/INC-4821", "Replay Forensics");
  } finally {
    await publicContext.close();
    await authContext.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
