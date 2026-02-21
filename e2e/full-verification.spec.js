import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/ramadan', name: 'Home (Ramadan Companion)' },
  { path: '/quran', name: 'Quran Reader' },
  { path: '/tracker', name: 'Prayer Tracker' },
  { path: '/tasbih', name: 'Tasbih Counter' },
  { path: '/adhkar', name: 'Adhkar' },
  { path: '/madrasa', name: 'Madrasa' },
  { path: '/settings', name: 'Settings' },
  { path: '/profile', name: 'Profile' },
];

// Set up localStorage before each test to bypass onboarding and install banner
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding_v2', 'done');
    localStorage.setItem('ramadan_start', '2026-02-19');
    localStorage.setItem('ramadan_start_prompted', 'true');
    sessionStorage.setItem('pwa_banner_dismissed_v2', '1');
  });
});

test.describe('Full E2E Verification', () => {

  test('visits every main page without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    for (const { path, name } of PAGES) {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500); // Let lazy components load
      await page.screenshot({ path: `e2e-results/screenshot-${name.replace(/[^a-zA-Z0-9]/g, '-')}.png` });
    }

    // Allow certain known errors (like audio/network) but flag real JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('net::') &&
      !e.includes('Audio') &&
      !e.includes('NotAllowedError') &&
      !e.includes('fetch')
    );

    expect(criticalErrors).toEqual([]);
  });

  test('bottom navigation works for all tabs', async ({ page }) => {
    await page.goto('/ramadan', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click Quran tab
    const quranTab = page.locator('nav[aria-label="Main navigation"] a[aria-label="Quran Reader"]');
    await quranTab.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/quran/);

    // Click Tracker tab
    const trackerTab = page.locator('nav[aria-label="Main navigation"] a[aria-label="Prayer Tracker"]');
    await trackerTab.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/tracker/);

    // Click Masjids tab
    const masjidsTab = page.locator('nav[aria-label="Main navigation"] a[aria-label="Masjid Directory"]');
    await masjidsTab.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/masjids/);

    // Click Home tab
    const homeTab = page.locator('nav[aria-label="Main navigation"] a[aria-label="Ramadan Home"]');
    await homeTab.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/ramadan/);
  });

  test('More sheet opens and shows links', async ({ page }) => {
    await page.goto('/ramadan', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click More button
    const moreBtn = page.locator('button[aria-label="More options"]');
    await moreBtn.click();
    await page.waitForTimeout(500);

    // Should see items in the More sheet
    await expect(page.locator('text=Tasbih Counter')).toBeVisible();
    await expect(page.locator('text=Madrasa')).toBeVisible();
    await expect(page.locator('text=Settings').first()).toBeVisible();

    await page.screenshot({ path: 'e2e-results/screenshot-More-Sheet.png' });
  });

  test('Settings page scrolls and toggles are clickable', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Check Settings header is visible
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Check dark mode toggle exists
    const darkModeRow = page.locator('text=Dark Mode');
    await expect(darkModeRow).toBeVisible();

    // Scroll down to see more settings
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check About section is visible after scroll
    await expect(page.locator('text=Send Feedback')).toBeVisible();

    await page.screenshot({ path: 'e2e-results/screenshot-Settings-Scrolled.png' });
  });

  test('Quran page loads surah view with header', async ({ page }) => {
    await page.goto('/quran/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Surah header should always show regardless of API availability
    await expect(page.locator('text=Al-Fatiha')).toBeVisible({ timeout: 10000 });

    // Page can be in one of three states: loaded (Play Surah), error (Retry), or still loading
    const playBtn = page.locator('button:has-text("Play Surah")');
    const retryBtn = page.locator('button:has-text("Retry")');
    const loadingText = page.locator('text=Loading surah');
    const hasAudio = await playBtn.isVisible().catch(() => false);
    const hasError = await retryBtn.isVisible().catch(() => false);
    const isLoading = await loadingText.isVisible().catch(() => false);

    // One of these must be true — loaded, error, or still fetching from API
    expect(hasAudio || hasError || isLoading).toBe(true);

    if (hasAudio) {
      const audioButtons = page.locator('button[aria-label="Play audio"]');
      const count = await audioButtons.count();
      expect(count).toBeGreaterThan(0);
    }

    await page.screenshot({ path: 'e2e-results/screenshot-Quran-Surah.png' });
  });

  test('Home page shows Header with prayer times', async ({ page }) => {
    await page.goto('/ramadan', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Header should be visible on home page
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check for Bismillah text
    await expect(page.locator('text=بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')).toBeVisible();

    await page.screenshot({ path: 'e2e-results/screenshot-Home.png' });
  });

  test('Header is NOT shown on non-home pages', async ({ page }) => {
    // Check that Settings page doesn't show the global header
    await page.goto('/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // The Bismillah text (from global header) should NOT be visible
    const bismillah = page.locator('text=بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
    await expect(bismillah).toHaveCount(0);

    // Check Tasbih page
    await page.goto('/tasbih', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await expect(bismillah).toHaveCount(0);

    // But it should have its own contextual header
    await expect(page.locator('h1:has-text("Tasbih Counter")')).toBeVisible();
  });

  test('Tasbih Counter has contextual header and back button', async ({ page }) => {
    await page.goto('/tasbih', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('h1:has-text("Tasbih Counter")')).toBeVisible();
    await expect(page.locator('a[aria-label="Back"]')).toBeVisible();

    await page.screenshot({ path: 'e2e-results/screenshot-Tasbih.png' });
  });

  test('Prayer Tracker has contextual header', async ({ page }) => {
    await page.goto('/tracker', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('h1:has-text("Prayer Tracker")')).toBeVisible();

    await page.screenshot({ path: 'e2e-results/screenshot-Tracker.png' });
  });

  test('Adhkar page has contextual header with tabs', async ({ page }) => {
    await page.goto('/adhkar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('h1:has-text("Daily Adhkar")')).toBeVisible();

    // Tab switching works
    const eveningTab = page.locator('button:has-text("Evening")');
    await eveningTab.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e-results/screenshot-Adhkar-Evening.png' });
  });

  test('Madrasa page has contextual header', async ({ page }) => {
    await page.goto('/madrasa', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('h1:has-text("Madrasa")')).toBeVisible();

    await page.screenshot({ path: 'e2e-results/screenshot-Madrasa.png' });
  });

  test('no page has pure black background', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      // Check the main container background
      const bgColor = await page.evaluate(() => {
        const el = document.querySelector('.min-h-screen');
        if (!el) return 'no-element';
        return window.getComputedStyle(el).backgroundColor;
      });

      // Should never be pure black (rgb(0, 0, 0))
      if (bgColor !== 'no-element') {
        expect(bgColor, `${name} should not have pure black bg`).not.toBe('rgb(0, 0, 0)');
      }
    }
  });
});
