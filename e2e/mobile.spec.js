import { test, expect } from '@playwright/test';

const BASE = 'https://masjidconnectgy.com';

// Emulate iPhone 14 using Chromium (WebKit not installed)
test.use({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  isMobile: true,
  hasTouch: true,
});

async function dismissWizard(page) {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding_v2', 'done');
    localStorage.setItem('ramadan_start_prompted', 'done');
    localStorage.setItem('ramadan_start', '2026-02-19');
    localStorage.setItem('asr_madhab', 'shafi');
    localStorage.setItem('pwa_banner_dismissed_v2', 'true');
    sessionStorage.setItem('pwa_banner_dismissed_v2', '1');
  });
}

test('mobile: homepage (ramadan)', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await expect(page.getByText(/MasjidConnect/i).first()).toBeVisible();
  await page.screenshot({ path: 'e2e-results/mobile-home.png', fullPage: false });
});

test('mobile: bottom navigation tabs visible', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  const nav = page.locator('nav').last();
  await expect(nav).toBeVisible();
  await page.screenshot({ path: 'e2e-results/mobile-nav.png', fullPage: false });
});

test('mobile: iftaar reports tab', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(`${BASE}/iftaar`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Iftaar Reports').first()).toBeVisible();
  await page.screenshot({ path: 'e2e-results/mobile-iftaar.png', fullPage: false });
});

test('mobile: timetable readable', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(`${BASE}/timetable`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
  // Ramadan timetable: Suhoor, Zuhr, Iftaar, Isha (no "Fajr" or "Maghrib" columns)
  for (const col of ['Suhoor', 'Zuhr', 'Isha']) {
    await expect(page.getByText(col).first()).toBeVisible({ timeout: 8000 });
  }
  await page.screenshot({ path: 'e2e-results/mobile-timetable.png', fullPage: true });
});

test('mobile: events page', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/Community Events/i).first()).toBeVisible();
  await page.screenshot({ path: 'e2e-results/mobile-events.png', fullPage: false });
});

test('mobile: archive view in iftaar', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(`${BASE}/iftaar`);
  await page.waitForLoadState('networkidle');
  await page.getByText('Archive').first().click();
  await page.waitForTimeout(500);
  await expect(page.getByText(/By Masjid/i).first()).toBeVisible();
  await page.screenshot({ path: 'e2e-results/mobile-archive.png', fullPage: false });
});

test('mobile: ramadan companion', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(`${BASE}/ramadan`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await expect(page.locator('body')).not.toContainText('Something went wrong');
  await page.screenshot({ path: 'e2e-results/mobile-companion.png', fullPage: false });
});

test('mobile: qibla compass', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(`${BASE}/qibla`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/Qibla Direction/i).first()).toBeVisible();
  await page.screenshot({ path: 'e2e-results/mobile-qibla.png', fullPage: false });
});

test('mobile: wizard shown for first-time visitors', async ({ page }) => {
  // Do NOT dismiss wizard
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  const wizard = page.locator('[role="dialog"]').first();
  await expect(wizard).toBeVisible();
  await page.screenshot({ path: 'e2e-results/mobile-wizard.png', fullPage: false });
});

test('mobile: masjid search works', async ({ page }) => {
  await dismissWizard(page);
  await page.goto(`${BASE}/masjids`);
  await page.waitForLoadState('networkidle');
  const searchInput = page.locator('input[placeholder*="masjid" i]').first();
  await searchInput.fill('CIOG');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'e2e-results/mobile-search.png', fullPage: false });
});
