import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(process.cwd(), "apps/web/node_modules/playwright"));

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "docs/screenshots");

const shots = [
  {
    name: "login.png",
    url: "/login",
    waitFor: "form#login-form",
  },
  {
    name: "command-center.png",
    url: "/command-center",
    waitFor: "text=Signal Queue",
    postWaitMs: 1500,
  },
  {
    name: "board.png",
    url: "/board",
    waitFor: "text=Workflow Tracking",
    postWaitMs: 800,
  },
  {
    name: "reports.png",
    url: "/reports",
    waitFor: "text=Reporting integrated with the operational platform",
    postWaitMs: 800,
  },
];

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedSession(page) {
  console.log("Seeding session into browser storage...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
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
}

async function capture(page, shot) {
  console.log(`Capturing ${shot.name} from ${shot.url}...`);
  await page.goto(`${BASE_URL}${shot.url}`, { waitUntil: "domcontentloaded" });

  if (shot.waitFor) {
    try {
      await page.locator(shot.waitFor).first().waitFor({ timeout: 10000 });
    } catch (error) {
      console.log(
        `Selector '${shot.waitFor}' did not appear for ${shot.name}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
      const bodyText = await page.locator("body").innerText().catch(() => "");
      console.log(bodyText.slice(0, 400));
      const diagnostics = await page
        .evaluate(() => ({
          tokenPresent: Boolean(window.localStorage.getItem("access_token")),
          currentPath: window.location.pathname,
          title: document.title,
        }))
        .catch(() => null);
      console.log(JSON.stringify(diagnostics));
    }
  }

  if (shot.postWaitMs) {
    await wait(shot.postWaitMs);
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, shot.name),
    fullPage: false,
  });
  console.log(`Saved ${shot.name}`);
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  page.on("console", (message) => {
    console.log(`[browser:${message.type()}] ${message.text()}`);
  });
  page.on("pageerror", (error) => {
    console.log(`[pageerror] ${error.message}`);
  });

  try {
    await capture(page, shots[0]);
    await seedSession(page);

    for (const shot of shots.slice(1)) {
      await capture(page, shot);
    }

    console.log(`Saved screenshots to ${SCREENSHOT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
