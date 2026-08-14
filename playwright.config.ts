import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end smoke test configuration.
 *
 * The web server runs `npm run preview` against a production build, so the
 * test exercises the exact bundle that ships to GitHub Pages.
 *
 * On CI the standard Chromium is installed via `npx playwright install
 * chromium`. In sandboxed/offline environments you can point Playwright at a
 * pre-extracted binary with `PLAYWRIGHT_EXECUTABLE_PATH` (see
 * `scripts/ensure-chromium.mjs`).
 */
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
