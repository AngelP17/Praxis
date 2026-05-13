import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(process.cwd(), "apps/web/node_modules/playwright"));

const BASE_URL = process.env.BASE_URL || "http://localhost:3456";
const OUT_DIR = path.resolve(process.cwd(), "screenshots/praxis");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture(page, fileName, route, options = {}) {
  const {
    waitForText,
    waitForSelector,
    screenshotSelector,
    scrollToText,
    scrollToSelector,
    postWaitMs = 2000,
    fullPage = false,
  } = options;
  
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

  if (scrollToSelector) {
    try {
      await page.locator(scrollToSelector).first().scrollIntoViewIfNeeded({ timeout: 15000 });
    } catch (e) {
      console.log(`  Selector '${scrollToSelector}' not scrolled, continuing...`);
    }
  }

  if (scrollToText) {
    try {
      await page.getByText(scrollToText, { exact: false }).first().scrollIntoViewIfNeeded({
        timeout: 15000,
      });
    } catch (e) {
      console.log(`  Text '${scrollToText}' not scrolled, continuing...`);
    }
  }
  
  await wait(postWaitMs);
  
  if (screenshotSelector) {
    const navOverride = await page.addStyleTag({
      content: "nav.fixed { display: none !important; }",
    });
    await page.locator(screenshotSelector).first().screenshot({
      path: path.join(OUT_DIR, fileName),
    });
    await navOverride.evaluate((node) => node.remove());
  } else {
    await page.screenshot({
      path: path.join(OUT_DIR, fileName),
      fullPage,
    });
  }
  console.log(`  Saved ${fileName}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 980 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log(`[error] ${msg.text()}`);
  });

  try {
    // 1. Landing / Hero
    await capture(page, "01-praxis-landing.png", "/", {
      waitForText: "Forward-deployed",
      postWaitMs: 3000,
    });
    
    // 2. Field Workbench
    await capture(page, "02-field-workbench.png", "/field-workbench", {
      waitForText: "Operational Overview",
      scrollToText: "Operational Overview",
      screenshotSelector: '[data-praxis-screen="overview"]',
      postWaitMs: 2500,
    });
    
    // 3. Proof Object
    await capture(page, "03-proof-object.png", "/proof/manufacturing-printer-gpo?proofSource=offline", {
      waitForText: "Proof object",
      postWaitMs: 2500,
    });
    
    // 4. Executive Readout
    await capture(page, "04-executive-readout.png", "/executive-readout/manufacturing-printer-gpo", {
      waitForText: "Executive Readout",
      postWaitMs: 2500,
    });
    
    // 5. Solution Packs
    await capture(page, "05-solution-packs.png", "/solution-packs", {
      waitForText: "Solution Pack Launcher",
      scrollToText: "Solution Pack Launcher",
      screenshotSelector: '[data-praxis-screen="solution-packs"]',
      postWaitMs: 2500,
    });
    
    // 6. Ontology
    await capture(page, "06-ontology.png", "/ontology", {
      waitForText: "Operational Ontology",
      scrollToText: "Operational Ontology",
      screenshotSelector: '[data-praxis-screen="ontology"]',
      postWaitMs: 2500,
    });
    
    // 7. Value Case
    await capture(page, "07-value-case.png", "/value-case", {
      waitForText: "Value Case Builder",
      scrollToText: "Value Case Builder",
      screenshotSelector: '[data-praxis-screen="value-case"]',
      postWaitMs: 2500,
    });
    
    // 8. Command Center
    await capture(page, "08-command-center.png", "/command-center", {
      waitForText: "Command Center",
      postWaitMs: 2500,
    });
    
    console.log(`\nAll Praxis screenshots saved to ${OUT_DIR}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
