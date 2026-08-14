import { expect, test } from '@playwright/test';

test.describe('SYNTHX-7', () => {
  test('boots the audio engine and exposes the synthesizer interface', async ({ page }) => {
    await page.goto('/');

    // Boot screen is shown first and requires an explicit gesture.
    const bootButton = page.getByRole('button', { name: /INITIALIZE AUDIO ENGINE/i });
    await expect(bootButton).toBeVisible();

    await bootButton.click();

    // After init, the full interface appears.
    await expect(page.getByText('OSCILLATORS // DUAL CORE')).toBeVisible();
    await expect(page.getByText('● DSP ACTIVE')).toBeVisible();

    // Controls are present and accessible.
    const sliders = page.getByRole('slider');
    await expect(sliders.first()).toBeVisible();
    await expect(page.getByText('PATCHES // PRESET BANK')).toBeVisible();

    // Playing a note on the computer keyboard must not throw and keeps the
    // interface intact.
    await page.keyboard.down('a');
    await page.keyboard.up('a');
    await expect(page.getByText('● DSP ACTIVE')).toBeVisible();
  });

  test('reports a console error if audio is unavailable', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'AudioContext stub only applies to Chromium');

    // Force AudioContext creation to fail, then verify the UI surfaces the
    // error instead of crashing.
    await page.addInitScript(() => {
      // @ts-expect-error — intentionally sabotage the constructor for this test.
      window.AudioContext = class {
        constructor() {
          throw new Error('Audio disabled for test');
        }
      };
    });

    await page.goto('/');
    await page.getByRole('button', { name: /INITIALIZE AUDIO ENGINE/i }).click();

    await expect(page.getByRole('alert')).toContainText(
      /Audio disabled for test|Web Audio API is not supported/i,
    );
  });
});
