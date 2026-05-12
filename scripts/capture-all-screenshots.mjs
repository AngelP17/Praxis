import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(process.cwd(), "apps/web/node_modules/playwright"));

const BASE_URL = process.env.BASE_URL || "http://localhost:3456";
const OUT_DIR = path.resolve(process.cwd(), "screenshots");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture(page, fileName, route, options = {}) {
  const { waitForText, waitForSelector, postWaitMs = 1200, scrollTo, fullPage = false } = options;
  
  console.log(`Capturing ${fileName} from ${route}...`);
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
  
  if (waitForSelector) {
    try {
      await page.locator(waitForSelector).first().waitFor({ timeout: 15000 });
    } catch (e) {
      console.log(`  Selector '${waitForSelector}' not found, continuing...`);
    }
  }
  
  if (waitForText) {
    try {
      await page.getByText(waitForText, { exact: false }).first().waitFor({ timeout: 15000 });
    } catch (e) {
      console.log(`  Text '${waitForText}' not found, continuing...`);
    }
  }
  
  if (scrollTo) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "auto" }), scrollTo);
    await wait(600);
  }
  
  await wait(postWaitMs);
  
  await page.screenshot({
    path: path.join(OUT_DIR, fileName),
    fullPage,
  });
  console.log(`  Saved ${fileName}`);
}

async function loginAsDemoOperator(page) {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.getByText("Sign In", { exact: false }).first().waitFor({ timeout: 15000 });
    
    // Try to fill login form
    const usernameInput = page.locator('input[name="username"], input#username, input[placeholder*="Username" i]').first();
    const passwordInput = page.locator('input[name="password"], input#password, input[type="password"]').first();
    
    if (await usernameInput.isVisible().catch(() => false)) {
      await usernameInput.fill("operator");
      await passwordInput.fill("operator");
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForURL(/\/(command-center|dashboard)/, { timeout: 15000 });
    }
  } catch {
    // Fallback: inject demo session
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
  }
  
  // Ensure we're on a logged-in page
  try {
    await page.getByText("Signal Queue", { exact: false }).first().waitFor({ timeout: 20000 });
  } catch {
    await page.getByText("Praxis", { exact: false }).first().waitFor({ timeout: 20000 });
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  
  // Public pages context
  const publicContext = await browser.newContext({
    viewport: { width: 1600, height: 980 },
    deviceScaleFactor: 2,
  });
  const publicPage = await publicContext.newPage();
  
  // Authenticated pages context
  const authContext = await browser.newContext({
    viewport: { width: 1600, height: 980 },
    deviceScaleFactor: 2,
  });
  const authPage = await authContext.newPage();
  
  // Log console messages for debugging
  publicPage.on("console", (msg) => {
    if (msg.type() === "error") console.log(`[public:error] ${msg.text()}`);
  });
  authPage.on("console", (msg) => {
    if (msg.type() === "error") console.log(`[auth:error] ${msg.text()}`);
  });

  try {
    // 1. Landing (public)
    await capture(publicPage, "01-landing.png", "/", {
      waitForText: "Operational decisions",
      postWaitMs: 2000,
    });
    
    // 2. Login (public)
    await capture(publicPage, "02-login.png", "/login", {
      waitForText: "Sign In",
      postWaitMs: 1000,
    });
    
    // Login as operator for authenticated shots
    console.log("Logging in as demo operator...");
    await loginAsDemoOperator(authPage);
    await wait(1500);
    
    // 3. Dashboard
    await capture(authPage, "03-dashboard.png", "/dashboard", {
      waitForText: "System Health",
      postWaitMs: 2000,
    });
    
    // 4. Command Center
    await capture(authPage, "04-command-center.png", "/command-center", {
      waitForText: "Signal Queue",
      postWaitMs: 2500,
    });
    
    // 5. Incidents list
    await capture(authPage, "05-incidents.png", "/incidents", {
      waitForText: "Incidents",
      postWaitMs: 2000,
    });
    
    // 6. Incident detail (INC-4821)
    await capture(authPage, "06-incident-detail.png", "/incidents/INC-4821", {
      waitForText: "INC-4821",
      postWaitMs: 2500,
    });
    
    // 7. Decision Center
    await capture(authPage, "07-decision-center.png", "/decision-center", {
      waitForText: "Decision",
      postWaitMs: 2500,
    });
    
    // 8. Platform
    await capture(authPage, "08-platform.png", "/platform", {
      waitForText: "Platform",
      postWaitMs: 2000,
    });
    
    // 9. Assets
    await capture(authPage, "09-assets.png", "/assets", {
      waitForText: "Assets",
      postWaitMs: 2000,
    });
    
    // 10. Audit
    await capture(authPage, "10-audit.png", "/audit", {
      waitForText: "Audit",
      postWaitMs: 2000,
    });
    
    // 11. Recommendations
    await capture(authPage, "11-recommendations.png", "/recommendations", {
      waitForText: "Recommendations",
      postWaitMs: 2000,
    });
    
    // 12. Event Ingestion
    await capture(authPage, "12-event-ingestion.png", "/event-ingestion", {
      waitForText: "Ingest",
      postWaitMs: 1500,
    });
    
    // 13. Replay
    await capture(authPage, "13-replay.png", "/replay/INC-4821", {
      waitForText: "Replay",
      postWaitMs: 2500,
    });
    
    // 14. Reports
    await capture(authPage, "14-reports.png", "/reports", {
      waitForText: "Reports",
      postWaitMs: 2000,
    });
    
    // 15. Admin
    await capture(authPage, "15-admin.png", "/admin", {
      waitForText: "Admin",
      postWaitMs: 2000,
    });
    
    console.log(`\nAll screenshots saved to ${OUT_DIR}`);
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
