/**
 * Prepare a usable Chromium binary in sandboxed environments where the
 * Playwright CDN is unreachable.
 *
 * Uses `@sparticuz/chromium` (an npm-packaged Chromium build) and extracts the
 * NSS/NSPR shared libraries it needs into a stable location. Prints the
 * executable path so callers can wire it into Playwright.
 *
 * Usage:
 *   CHROMIUM_BIN="$(node scripts/ensure-chromium.mjs)"
 *   LD_LIBRARY_PATH=/tmp/chromium-libs/lib \
 *   PLAYWRIGHT_EXECUTABLE_PATH="$CHROMIUM_BIN" npx playwright test
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(here, '..', 'node_modules', '@sparticuz', 'chromium');

const LIBS_DIR = '/tmp/chromium-libs';

async function main() {
  const { default: chromium } = await import('@sparticuz/chromium');
  const executablePath = await chromium.executablePath();

  // Extract the Amazon Linux 2023 compatibility libraries (NSS/NSPR).
  const archivePath = join(pkgDir, 'bin', 'al2023.tar.br');
  const tarPath = join(LIBS_DIR, 'al2023.tar');
  try {
    mkdirSync(LIBS_DIR, { recursive: true });
    writeFileSync(tarPath, brotliDecompressSync(readFileSync(archivePath)));
    // Extract with a minimal tar implementation via system `tar` if present.
    const { execSync } = await import('node:child_process');
    try {
      execSync(`tar xf ${JSON.stringify(tarPath)} -C ${JSON.stringify(LIBS_DIR)}`, {
        stdio: 'ignore',
      });
    } catch {
      throw new Error('Could not extract the chromium compatibility libraries (tar missing?).');
    }
  } catch (error) {
    // The libraries may already be extracted from a previous run.
    if (!executablePath) throw error;
  }

  console.log(executablePath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
