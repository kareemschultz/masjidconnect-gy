import { test } from '@playwright/test';

test.describe('App layout without modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('onboarding_v2', 'done'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test('Home — actual app', async ({ page }) => {
    await page.screenshot({ path: 'e2e-results/app-home-clean.png' });
  });

  test('Masjids tab', async ({ page }) => {
    await page.goto('/masjids');
    await page.evaluate(() => localStorage.setItem('onboarding_v2', 'done'));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e-results/app-masjids-clean.png' });
  });

  test('Iftaar tab', async ({ page }) => {
    await page.goto('/iftaar');
    await page.evaluate(() => localStorage.setItem('onboarding_v2', 'done'));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e-results/app-iftaar-clean.png' });
  });
});
