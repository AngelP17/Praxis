import { defineConfig } from "playwright/test";

// Default to a dedicated port so the smoke suite never silently targets an
// unrelated app that happens to own :3000. Override with BASE_URL to point the
// suite at an already-running server (any port).
const baseURL = process.env.BASE_URL || "http://localhost:4310";
const port = new URL(baseURL).port || "80";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  webServer: {
    command: `NEXT_PUBLIC_DEMO_MODE=1 pnpm exec next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
});
