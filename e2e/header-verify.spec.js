import { test } from '@playwright/test';

test('header screenshot', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding_v2', 'done');
    localStorage.setItem('ramadan_start', '2026-02-19');
    localStorage.setItem('ramadan_start_prompted', 'done');
  });
  await page.goto('https://masjidconnectgy.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const header = page.locator('header');
  await header.screenshot({ path: '/tmp/ss-header-fixed.png' });
});
