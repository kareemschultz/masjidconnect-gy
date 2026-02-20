import { test, expect } from '@playwright/test';
const BASE = 'https://masjidconnectgy.com';
async function skip(page) {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding_v2', 'done');
    localStorage.setItem('ramadan_start', '2026-02-19');
    localStorage.setItem('ramadan_start_prompted', 'done');
  });
}
test.use({ viewport: { width: 390, height: 844 } });

test('Zakat Calculator loads', async ({ page }) => {
  await skip(page);
  await page.goto(`${BASE}/zakat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await expect(page.locator('text=Zakat Calculator').first()).toBeVisible();
  await expect(page.locator('text=Nisab Method')).toBeVisible();
  await page.screenshot({ path: '/tmp/ss-zakat.png' });
});

test('Zakat Calculator computes correctly', async ({ page }) => {
  await skip(page);
  await page.goto(`${BASE}/zakat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // Enter $5,000,000 GYD cash savings
  await page.locator('input').first().fill('8000');  // gold price
  const inputs = page.locator('input[type="number"]');
  // Fill cash field (3rd input after gold price and silver price)
  await inputs.nth(2).fill('5000000');
  await page.waitForTimeout(500);
  // Should show zakat due (5M > nisab)
  await expect(page.locator('text=Zakat Due').first()).toBeVisible();
  await page.screenshot({ path: '/tmp/ss-zakat-result.png' });
});
