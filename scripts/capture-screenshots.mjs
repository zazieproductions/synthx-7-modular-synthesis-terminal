/**
 * Capture documentation screenshots of the running synthesizer.
 *
 * Builds the production bundle, serves it with `vite preview`, boots the app
 * in headless Chromium, starts the audio engine, loads a patch, holds a chord
 * so the visualizers show live signal, and writes:
 *
 *   - docs/images/agon-signal-engine-preview.png  (1920×1080, full interface)
 *   - docs/images/agon-social-preview.png         (1280×640 social-preview artwork)
 *   - public/og-image.png                         (site Open Graph image, same artwork)
 *
 * The social preview is a purpose-built HTML page that reuses the app's own
 * self-hosted fonts and neon palette, so the text is crisp and exact (it is
 * NOT an AI-generated bitmap with garbled lettering).
 *
 * In restricted-network environments the Chromium binary comes from the
 * npm-packaged `@sparticuz/chromium` build.
 */
import { spawn } from 'node:child_process';
import { socialPreviewHtml } from './social-preview-template.mjs';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { chromium as playwright } from 'playwright';

const BASE_URL = 'http://127.0.0.1:4173/';
const BG = '#0a0a0f';

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
      const args = sparticuz.args.includes('--no-sandbox')
        ? sparticuz.args
        : [...sparticuz.args, '--no-sandbox'];
      return {
        executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
        args,
        headless: true,
      };
    } catch {
      return { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, headless: true };
    }
  }
  return { headless: true, args: ['--no-sandbox'] };
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
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /INITIALIZE AUDIO ENGINE/i }).click();
  await page.waitForSelector('section[aria-label="Oscillators"]', { timeout: 15_000 });
}

/**
 * Verify the visualizers are actually showing live signal: every canvas is
 * sampled and its pixel variance reported. A flat/black canvas would fail.
 */
async function reportVisualizerActivity(page) {
  const report = await page.$$eval('canvas', (canvases) =>
    canvases.map((canvas) => {
      const label = (canvas.getAttribute('aria-label') ?? canvas.className) || 'canvas';
      const width = canvas.width;
      const height = canvas.height;
      const ctx = canvas.getContext('2d');
      if (!ctx || width === 0 || height === 0)
        return { label, width, height, variance: 0, mean: 0 };
      const { data } = ctx.getImageData(0, 0, width, height);
      let sum = 0;
      let sumSq = 0;
      let colored = 0;
      // Small canvases need denser sampling to catch thin meter bars.
      const step = width * height > 200_000 ? 64 : 16;
      for (let i = 0; i < data.length; i += 4 * step) {
        const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        sum += lum;
        sumSq += lum * lum;
        const max = Math.max(data[i], data[i + 1], data[i + 2]);
        const min = Math.min(data[i], data[i + 1], data[i + 2]);
        if (max - min > 40) colored += 1;
      }
      const n = data.length / (4 * step);
      const mean = sum / n;
      const variance = sumSq / n - mean * mean;
      return {
        label,
        width,
        height,
        variance: Math.round(variance),
        colored: Math.round((colored / n) * 100),
      };
    }),
  );
  console.log('Visualizer activity:');
  for (const r of report) {
    console.log(
      `  ${String(r.label).padEnd(22)} ${String(r.width).padStart(5)}×${String(r.height).padEnd(5)} ` +
        `variance=${String(r.variance).padStart(6)} colored=${String(r.colored).padStart(3)}%`,
    );
  }
  const live = report.filter((r) => r.variance > 20);
  if (live.length < 2) {
    throw new Error('Visualizers look flat — the capture may show a dead interface.');
  }
  return report;
}

/** Scale a screenshot to fit (centered) on a target canvas, padded with BG. */
async function fitOnCanvas(page, srcPath, outPath, targetW, targetH) {
  const b64 = readFileSync(srcPath).toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;
  const result = await page.evaluate(
    async ({ dataUrl, targetW, targetH, bg }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no 2d context');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, targetW, targetH);
      const scale = Math.min(targetW / img.width, targetH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
      return canvas.toDataURL('image/png');
    },
    { dataUrl, targetW, targetH, bg: BG },
  );
  writeFileSync(outPath, Buffer.from(result.split(',')[1], 'base64'));
  console.log(`Wrote ${outPath} (${targetW}×${targetH})`);
}

async function captureInterface(page, compositePage) {
  await boot(page);

  // A meaningful patch: ALIEN — LFO-wobbled filter, detuned voices, FX sends.
  await page.getByRole('button', { name: 'ALIEN', exact: true }).click();
  await page.waitForTimeout(250);
  const alienActive = await page
    .getByRole('button', { name: 'ALIEN', exact: true })
    .getAttribute('aria-pressed');
  if (alienActive !== 'true') {
    throw new Error('ALIEN preset did not load — parameter settings would be misleading.');
  }

  // Hold a chord so every visualizer shows live signal (C4 · D4 · E4).
  await page.keyboard.down('a');
  await page.keyboard.down('s');
  await page.keyboard.down('d');
  await page.waitForTimeout(1400); // let the spectrogram waterfall accumulate

  await reportVisualizerActivity(page);

  const rawPath = '/tmp/agon-interface-full.png';
  await page.screenshot({ path: rawPath, fullPage: true });
  await page.keyboard.up('a');
  await page.keyboard.up('s');
  await page.keyboard.up('d');

  // 16:9 composition: scale the full page to fit height 1080 and center it
  // on the app's own background colour — gutters are seamless.
  await fitOnCanvas(
    compositePage,
    rawPath,
    'docs/images/agon-signal-engine-preview.png',
    1920,
    1080,
  );
}

async function captureSocialPreview(page) {
  const htmlPath = 'dist/agon-social-preview.html';
  writeFileSync(htmlPath, socialPreviewHtml());
  await page.goto(`${BASE_URL}agon-social-preview.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600); // let the scope animation render a few frames
  await page.screenshot({ path: 'docs/images/agon-social-preview.png' });
  console.log('Wrote docs/images/agon-social-preview.png (1280×640)');
  writeFileSync('public/og-image.png', readFileSync('docs/images/agon-social-preview.png'));
  console.log('Copied public/og-image.png (site Open Graph image)');
  rmSync(htmlPath, { force: true });
}

async function main() {
  mkdirSync('docs/images', { recursive: true });
  mkdirSync('public', { recursive: true });

  const server = startPreview();
  try {
    await waitForServer(BASE_URL);

    const browser = await playwright.launch(await resolveLaunch());
    try {
      // Create ALL pages up front — the single-process Chromium build tears the
      // browser down when a page is closed, so no page is closed mid-run.
      const interfacePage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
      const compositePage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
      const socialPage = await browser.newPage({ viewport: { width: 1280, height: 640 } });

      await captureInterface(interfacePage, compositePage);
      await captureSocialPreview(socialPage);
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
  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
