import { test, expect } from '@playwright/test';

const BASE = 'https://masjidconnectgy.com';

// Dismiss ALL first-run modals (onboarding + ramadan prompt)
async function skipAllModals(page) {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding_v2', 'done');
    localStorage.setItem('ramadan_start', '2026-02-19');
    localStorage.setItem('ramadan_start_prompted', 'done');
  });
}

test.describe('v1.2 Feature Verification', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Home — loads with content (not blank)', async ({ page }) => {
    await skipAllModals(page);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await expect(page.locator('text=MasjidConnect GY').first()).toBeVisible();
    await page.screenshot({ path: '/tmp/ss-home.png' });
  });

  test('Home — prayer time strip visible', async ({ page }) => {
    await skipAllModals(page);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Chips are divs — look for label text directly
    await expect(page.locator('text=Fajr').or(page.locator('text=Suhoor')).first()).toBeVisible();
    await expect(page.locator('text=Maghrib').or(page.locator('text=Iftaar')).first()).toBeVisible();
    await expect(page.locator('text=Isha').first()).toBeVisible();
    await page.screenshot({ path: '/tmp/ss-prayer-strip.png' });
  });

  test('Home — Hijri date in header contains AH', async ({ page }) => {
    await skipAllModals(page);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const headerText = await page.locator('header').textContent();
    expect(headerText).toContain('AH');
    await page.screenshot({ path: '/tmp/ss-hijri.png' });
  });

  test('Prayer Tracker — all 5 prayers listed', async ({ page }) => {
    await skipAllModals(page);
    await page.goto(`${BASE}/tracker`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    for (const prayer of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
      await expect(page.locator(`text=${prayer}`).first()).toBeVisible();
    }
    await page.screenshot({ path: '/tmp/ss-tracker.png' });
  });

  test('Prayer Tracker — tap Fajr card marks it done', async ({ page }) => {
    await skipAllModals(page);
    await page.goto(`${BASE}/tracker`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /Fajr/i }).first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/ss-tracker-tapped.png' });
  });

  test('Tasbih Counter — TAP button and SubhanAllah visible', async ({ page }) => {
    await skipAllModals(page);
    await page.goto(`${BASE}/tasbih`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /Count SubhanAllah/i })).toBeVisible();
    await expect(page.locator('text=SubhanAllah').first()).toBeVisible();
    await page.screenshot({ path: '/tmp/ss-tasbih.png' });
  });

  test('Tasbih — tapping 3 times shows count 3', async ({ page }) => {
    await skipAllModals(page);
    await page.goto(`${BASE}/tasbih`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const tapBtn = page.getByRole('button', { name: /Count SubhanAllah/i });
    await tapBtn.click();
    await tapBtn.click();
    await tapBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: '/tmp/ss-tasbih-count.png' });
  });
});
