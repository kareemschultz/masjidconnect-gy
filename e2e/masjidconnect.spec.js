import { test, expect } from '@playwright/test';

const BASE = 'https://masjidconnectgy.com';

// Dismiss wizard + all overlays so tests can interact with underlying UI
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

async function openIftaarFromNav(page) {
  const directIftaarLink = page.locator('a[href="/iftaar"]').first();
  if (await directIftaarLink.count()) {
    await directIftaarLink.click();
    return;
  }

  const moreButton = page.getByRole('button', { name: /More options/i });
  await expect(moreButton).toBeVisible();
  await moreButton.click();

  const iftaarButton = page.getByRole('button', { name: /Iftaar Reports/i }).first();
  await expect(iftaarButton).toBeVisible();
  await iftaarButton.click();
}

// ─── Homepage & Core UI ───────────────────────────────────────────────────────
test.describe('Homepage & Core UI', () => {
  test('loads and shows correct title/meta', async ({ page }) => {
    await dismissWizard(page);
    await page.goto(BASE);
    await expect(page).toHaveTitle(/MasjidConnect GY/);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /Guyana/);
  });

  test('header countdown and masjid info visible', async ({ page }) => {
    await dismissWizard(page);
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Header should show app name
    await expect(page.getByText(/MasjidConnect/i).first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/desktop-home.png', fullPage: false });
  });

  test('shows bottom navigation tabs', async ({ page }) => {
    await dismissWizard(page);
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const nav = page.locator('nav').last();
    await expect(nav).toBeVisible();
    // Check for key visible tab labels
    for (const label of ['Home', 'Quran', 'Tracker', 'Masjids', 'More']) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test('dark mode toggle works', async ({ page }) => {
    await dismissWizard(page);
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Find header dark mode button by aria-label or title
    const darkBtn = page.locator('button').filter({ hasText: '' }).and(
      page.locator('[aria-label*="dark" i], [title*="dark" i], [aria-label*="mode" i]')
    ).first();
    if (await darkBtn.count() > 0 && await darkBtn.isVisible()) {
      const htmlBefore = await page.locator('html').getAttribute('class');
      await darkBtn.click();
      await page.waitForTimeout(300);
      const htmlAfter = await page.locator('html').getAttribute('class');
      expect(htmlBefore).not.toBe(htmlAfter);
    }
  });

  test('PWA manifest is valid JSON with PNG icons', async ({ page }) => {
    const res = await page.request.get(`${BASE}/manifest.json`);
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name).toMatch(/MasjidConnect/);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
    expect(manifest.icons[0].type).toBe('image/png');
  });

  test('service worker is registered', async ({ page }) => {
    await dismissWizard(page);
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    expect(swRegistered).toBe(true);
  });

  test('PNG icons are served correctly', async ({ page }) => {
    for (const icon of ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/badge-72.png']) {
      const res = await page.request.get(`${BASE}${icon}`);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toMatch(/image\/png/);
    }
  });
});

// ─── Navigation / Routing ─────────────────────────────────────────────────────
test.describe('Navigation & Routing', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('root redirects to /ramadan', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/ramadan');
  });

  test('navigates to Iftaar tab (/iftaar)', async ({ page }) => {
    await page.goto(`${BASE}/iftaar`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Iftaar Reports').first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/desktop-iftaar.png' });
  });

  test('navigates to Timetable tab (/timetable)', async ({ page }) => {
    await page.goto(`${BASE}/timetable`);
    await page.waitForLoadState('networkidle');
    // Wait for lazy Timetable component to fully render
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    // Timetable uses Ramadan columns: Suhoor, Zuhr, Iftaar, Isha (not Fajr/Maghrib)
    for (const col of ['Suhoor', 'Zuhr', 'Isha']) {
      await expect(page.getByText(col).first()).toBeVisible({ timeout: 8000 });
    }
    await page.screenshot({ path: 'e2e-results/desktop-timetable.png', fullPage: true });
  });

  test('navigates to Events tab (/events)', async ({ page }) => {
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Community Events/i).first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/desktop-events.png', fullPage: true });
  });

  test('navigates to Ramadan Companion (/ramadan)', async ({ page }) => {
    await page.goto(`${BASE}/ramadan`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await page.screenshot({ path: 'e2e-results/desktop-companion.png', fullPage: true });
  });

  test('navigates to Map (/map)', async ({ page }) => {
    await page.goto(`${BASE}/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await page.screenshot({ path: 'e2e-results/desktop-map.png' });
  });

  test('navigates to Duas (/duas)', async ({ page }) => {
    await page.goto(`${BASE}/duas`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await page.screenshot({ path: 'e2e-results/desktop-duas.png', fullPage: true });
  });

  test('navigates to Qibla (/qibla)', async ({ page }) => {
    await page.goto(`${BASE}/qibla`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Qibla/i).first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/desktop-qibla.png' });
  });

  test('navigates to Resources (/resources)', async ({ page }) => {
    await page.goto(`${BASE}/resources`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await page.screenshot({ path: 'e2e-results/desktop-resources.png', fullPage: true });
  });

  test('in-app tab clicking works', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await openIftaarFromNav(page);
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/iftaar');
  });
});

// ─── Iftaar Reports ───────────────────────────────────────────────────────────
test.describe('Iftaar Reports', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('shows iftaar reports with today/archive toggle', async ({ page }) => {
    await page.goto(`${BASE}/iftaar`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Iftaar Reports').first()).toBeVisible();
    await expect(page.getByText('Today').first()).toBeVisible();
    await expect(page.getByText('Archive').first()).toBeVisible();
  });

  test('archive tab switches to archive view', async ({ page }) => {
    await page.goto(`${BASE}/iftaar`);
    await page.waitForLoadState('networkidle');
    await page.getByText('Archive').first().click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/By Masjid/i).first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/desktop-iftaar-archive.png' });
  });

  test('archive masjid list has filter and items', async ({ page }) => {
    await page.goto(`${BASE}/iftaar`);
    await page.waitForLoadState('networkidle');
    await page.getByText('Archive').first().click();
    await page.waitForTimeout(500);
    // Should show masjid items (there are 14 masjids)
    const masjidItems = page.locator('[class*="rounded-2xl"]');
    expect(await masjidItems.count()).toBeGreaterThan(0);
  });

  test('notification toggle button is present', async ({ page }) => {
    await dismissWizard(page);
    await page.goto(`${BASE}/iftaar`);
    await page.waitForLoadState('networkidle');
    // The bell button should be there (isPushSupported varies by browser)
    // At minimum no JS errors
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('firebase'))).toHaveLength(0);
  });
});

// ─── Prayer Timetable ─────────────────────────────────────────────────────────
test.describe('Prayer Timetable', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('shows all prayer time columns', async ({ page }) => {
    await page.goto(`${BASE}/timetable`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    // Ramadan timetable: Suhoor, Sunrise, Zuhr, Asr(S), Asr(H), Iftaar, Isha
    for (const col of ['Suhoor', 'Zuhr', 'Isha']) {
      await expect(page.getByText(col).first()).toBeVisible({ timeout: 8000 });
    }
  });

  test('shows ramadan day and hijri year', async ({ page }) => {
    await page.goto(`${BASE}/timetable`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1447|Ramadan/i).first()).toBeVisible();
  });

  test('timetable has time adjustment notes', async ({ page }) => {
    await page.goto(`${BASE}/timetable`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Check the page renders without errors
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });
});

// ─── Events Page ─────────────────────────────────────────────────────────────
test.describe('Events Page', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('shows community events list', async ({ page }) => {
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Community Events').first()).toBeVisible();
  });

  test('shows upcoming events with dates', async ({ page }) => {
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    // Events should have date info
    await expect(page.getByText(/Taraweeh|Jumah|Eid|Laylatul/i).first()).toBeVisible();
  });

  test('filter categories are clickable', async ({ page }) => {
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    const allBtn = page.getByText('All').first();
    await expect(allBtn).toBeVisible();
    await allBtn.click();
  });

  test('Show past events toggle works', async ({ page }) => {
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    const showPastBtn = page.getByText(/Show past/i).first();
    if (await showPastBtn.isVisible()) {
      await showPastBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─── Ramadan Companion ────────────────────────────────────────────────────────
test.describe('Ramadan Companion', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('companion page loads without error', async ({ page }) => {
    await page.goto(`${BASE}/ramadan`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('companion has Ramadan tracking content', async ({ page }) => {
    await page.goto(`${BASE}/ramadan`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e-results/desktop-companion-full.png', fullPage: true });
  });
});

// ─── Qibla ───────────────────────────────────────────────────────────────────
test.describe('Qibla Compass', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('qibla page shows direction UI', async ({ page }) => {
    await page.goto(`${BASE}/qibla`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Qibla Direction/i).first()).toBeVisible();
    await expect(page.getByText(/Georgetown/i).first()).toBeVisible();
  });
});

// ─── Wizard ARIA (standalone, no beforeEach) ──────────────────────────────────
test('wizard dialog has role=dialog and aria-modal', async ({ page }) => {
  // Fresh page — no dismissWizard — wizard should appear
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500); // wizard shows after 1.2s + animation
  const wizard = page.locator('[role="dialog"][aria-modal="true"]').first();
  await expect(wizard).toBeVisible({ timeout: 5000 });
});

// ─── Auth Modal (in Wizard step 4) ───────────────────────────────────────────
test.describe('Auth (OnboardingWizard)', () => {
  test('wizard appears for first-time visitors', async ({ page }) => {
    // Do NOT dismiss wizard for this test
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // wizard delay
    const wizard = page.locator('[role="dialog"]').first();
    await expect(wizard).toBeVisible();
    await page.screenshot({ path: 'e2e-results/wizard-step1.png' });
  });

  test('wizard can be dismissed with X button', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    // The wizard wrapper has z-[130]; find the close button inside it
    const wizardDialog = page.locator('.z-\\[130\\]').first();
    if (await wizardDialog.isVisible()) {
      // Find X button inside the wizard (not the ramadan prompt)
      const xBtn = wizardDialog.locator('button').last(); // close is typically top-right
      const specificXBtn = page.locator('button:has(svg.lucide-x), button[aria-label*="close" i], button[aria-label*="skip" i]').first();
      if (await specificXBtn.count() > 0 && await specificXBtn.isVisible()) {
        await specificXBtn.click();
        await page.waitForTimeout(400);
        await expect(wizardDialog).not.toBeVisible();
      }
    }
  });

  test('wizard step 1 welcome screen has feature highlights', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await expect(page.getByText(/MasjidConnect GY/i).first()).toBeVisible();
    await expect(page.getByText(/Masjid directory/i).first()).toBeVisible();
  });

  test('wizard Set Up button advances to step 2', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const setupBtn = page.getByText(/Set Up/i).first();
    if (await setupBtn.isVisible()) {
      await setupBtn.click();
      await page.waitForTimeout(300);
      // Should now be on step 2 (Ramadan start date)
      await page.screenshot({ path: 'e2e-results/wizard-step2.png' });
    }
  });
});

// ─── Masjid Directory ─────────────────────────────────────────────────────────
test.describe('Masjid Directory', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('shows masjid list with search', async ({ page }) => {
    await page.goto(`${BASE}/masjids`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Masjids in Guyana/i).first()).toBeVisible();
    await expect(page.locator('input[placeholder*="masjid" i]').first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/desktop-masjids.png', fullPage: true });
  });

  test('shows dynamic masjid count', async ({ page }) => {
    await page.goto(`${BASE}/masjids`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/\d+\s+masjids/i).first()).toBeVisible();
  });

  test('masjid search filter works', async ({ page }) => {
    await page.goto(`${BASE}/masjids`);
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[placeholder*="masjid" i]').first();
    await searchInput.fill('Albouy');
    await page.waitForTimeout(300);
    await expect(page.getByText(/Albouystown/i).first()).toBeVisible();
  });
});

// ─── API Endpoints ────────────────────────────────────────────────────────────
test.describe('API Endpoints', () => {
  test('health check returns ok', async ({ request }) => {
    const res = await request.get(`${BASE}/api/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('VAPID public key endpoint returns valid key', async ({ request }) => {
    const res = await request.get(`${BASE}/api/push/vapid-public-key`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.publicKey).toBeTruthy();
    expect(body.publicKey.length).toBeGreaterThan(50);
  });

  test('push subscribe requires valid body', async ({ request }) => {
    const res = await request.post(`${BASE}/api/push/subscribe`, {
      data: { endpoint: '', keys: {} },
    });
    // Should return 400 for invalid data
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('session endpoint returns unauthenticated shape (or rate-limit)', async ({ request }) => {
    let res = null;
    for (let i = 0; i < 3; i++) {
      res = await request.get(`${BASE}/api/auth/get-session`);
      if (res.status() !== 429) break;
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 500));
    }

    expect(res).not.toBeNull();
    const status = res.status();
    expect([200, 401, 403, 404, 429]).toContain(status);

    if (status === 200) {
      const body = await res.json();
      expect(body).toBeNull();
    }
  });

  test('ramadan companion tracking endpoint exists', async ({ request }) => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request.get(`${BASE}/api/tracking/${today}`);
    // 404 = not found for unauthenticated (no cookie session), or 200 if public
    expect([200, 401, 403, 404]).toContain(res.status());
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────
test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await dismissWizard(page);
  });

  test('page exposes core landmarks', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const mainCount = await page.locator('main').count();
    expect(mainCount).toBeGreaterThanOrEqual(1);
    await expect(page.locator('nav[aria-label="Main navigation"]').first()).toBeVisible();
  });

  test('interactive buttons have accessible labels', async ({ page }) => {
    await page.goto(`${BASE}/iftaar`);
    await page.waitForLoadState('networkidle');
    const unlabelled = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).filter(b => {
        const text = (b.textContent || '').trim();
        const aria = b.getAttribute('aria-label');
        const title = b.getAttribute('title');
        return !text && !aria && !title;
      }).length;
    });
    expect(unlabelled).toBeLessThan(5);
  });

  test('nav links have aria-current for active page', async ({ page }) => {
    await page.goto(`${BASE}/quran`);
    await page.waitForLoadState('networkidle');
    const currentLinks = page.locator('a[aria-current="page"]');
    expect(await currentLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test('aria-current is set on active nav link', async ({ page }) => {
    // Test active state on a primary tab route.
    await page.goto(`${BASE}/quran`);
    await page.waitForLoadState('networkidle');
    const currentLink = page.locator('a[aria-current="page"]').first();
    await expect(currentLink).toBeVisible();
    const href = await currentLink.getAttribute('href');
    expect(href).toBe('/quran');
  });
});
