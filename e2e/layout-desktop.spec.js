import { test } from '@playwright/test';

test('Desktop layout', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e-results/layout-desktop-home.png', fullPage: false });
  // Dismiss onboarding if present
  const closeBtn = page.locator('button[aria-label="Close onboarding"]');
  if (await closeBtn.isVisible()) await closeBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'e2e-results/layout-desktop-no-modal.png', fullPage: false });
});
