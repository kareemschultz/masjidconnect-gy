import { test, expect } from '@playwright/test';

test.describe('Layout Stability Check', () => {

  test('Mobile home — initial load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-results/layout-mobile-load1.png', fullPage: false });
  });

  test('Mobile home — after hard reload (simulates refresh)', async ({ page }) => {
    // First visit
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    // Hard reload (bypass cache)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-results/layout-mobile-reload.png', fullPage: false });
  });

  test('Mobile home — full page scroll', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-results/layout-mobile-full.png', fullPage: true });
  });

  test('Mobile navigation bar', async ({ page }) => {
    await page.goto('/iftaar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-results/layout-nav-iftaar.png', fullPage: false });
  });

  test('Mobile masjid directory', async ({ page }) => {
    await page.goto('/masjids', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-results/layout-masjids.png', fullPage: false });
  });

  test('Mobile events', async ({ page }) => {
    await page.goto('/events', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-results/layout-events.png', fullPage: false });
  });

});
