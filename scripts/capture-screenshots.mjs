/**
 * Capture documentation screenshots of the running synthesizer.
 *
 * Builds the production bundle, serves it with `vite preview`, boots the app
 * in headless Chromium, starts the audio engine, holds a chord so the
 * visualizers show live signal, and writes:
 *
 *   - docs/images/synthx-7-interface.png  (full interface)
 *   - docs/images/synthx-7-closeup.png    (oscillator + filter close-up, @2x)
 *   - public/og-image.png                 (1200×630 social preview)
 *
 * In restricted-network environments the Chromium binary comes from the
 * npm-packaged `@sparticuz/chromium` build.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium as playwright } from 'playwright';

const BASE_URL = 'http://127.0.0.1:4173/';

/**
 * Resolve how to launch Chromium.
 *
 * - Default: Playwright's bundled Chromium (`npx playwright install chromium`).
 * - Offline/restricted environments can point at an npm-packaged build via
 *   `PLAYWRIGHT_EXECUTABLE_PATH` (see `scripts/ensure-chromium.mjs`), in which
 *   case we borrow its recommended launch flags from `@sparticuz/chromium` when
 *   that package is available.
 */
async function resolveLaunch() {
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
    try {
      const { default: sparticuz } = await import('@sparticuz/chromium');
      return {
        executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
        args: sparticuz.args,
        headless: true,
      };
    } catch {
      return { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, headless: true };
    }
  }
  return { headless: true };
}

function startPreview() {
  return spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      'preview',
      '--host',
      '127.0.0.1',
      '--port',
      '4173',
      '--strictPort',
    ],
    { cwd: process.cwd(), stdio: 'ignore', detached: true },
  );
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function boot(page) {
  await page.goto(BASE_URL);
  await page.getByRole('button', { name: /INITIALIZE AUDIO ENGINE/i }).click();
  await page.waitForSelector('section[aria-label="Oscillators"]', { timeout: 15_000 });
}

async function main() {
  mkdirSync('docs/images', { recursive: true });
  mkdirSync('public', { recursive: true });

  const server = startPreview();
  try {
    await waitForServer(BASE_URL);

    const browser = await playwright.launch(await resolveLaunch());
    try {
      // Create all pages up front — the single-process build tears the browser
      // down when a page is closed, so we never close a page mid-run.
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const closeup = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });
      const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });

      // Full interface.
      await boot(page);
      await page.keyboard.down('a');
      await page.keyboard.down('s');
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'docs/images/synthx-7-interface.png', fullPage: true });
      await page.keyboard.up('a');
      await page.keyboard.up('s');

      // Close-up of the synthesis controls at 2× device scale.
      await boot(closeup);
      await closeup.keyboard.down('a');
      await closeup.waitForTimeout(400);
      const controlsGrid = closeup.locator('section[aria-label="Oscillators"]').locator('xpath=..');
      await controlsGrid.screenshot({ path: 'docs/images/synthx-7-closeup.png' });
      await closeup.keyboard.up('a');

      // Social preview at 1200×630.
      await boot(og);
      await og.waitForTimeout(400);
      await og.screenshot({ path: 'public/og-image.png' });
    } finally {
      await browser.close();
    }
  } finally {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill('SIGTERM');
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
