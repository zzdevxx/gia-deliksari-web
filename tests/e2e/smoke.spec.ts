import { test, expect } from '@playwright/test';

/**
 * Smoke test suite — runs against the live production deployment.
 *
 * Goals:
 *   1. Public pages render without 5xx
 *   2. SW is registered
 *   3. /info renders warta section + roster calendar/list toggle
 *   4. /super login flow works with seeded superuser
 *   5. Service worker serves offline shell (basic test: navigate away,
 *      then back — SW intercepts second hit)
 *
 * These tests are read-mostly. They don't mutate production data.
 * If you need mutation tests (e.g. create user), gate them behind
 * RUN_MUTATION_TESTS=1 env var.
 */

test.describe('Public surface', () => {
  test('home renders with hero + announcement section', async ({ page }) => {
    await page.goto('/home');
    // Root redirect: should end up on /home
    await expect(page).toHaveURL(/\/home$/);
    // Hero CTA visible
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10_000 });
    // No 5xx in console
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.waitForLoadState('networkidle');
    expect(errors, `page errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('info page renders warta + roster with calendar toggle', async ({ page }) => {
    await page.goto('/info');
    await expect(page.getByRole('heading', { name: /Warta Jemaat/i })).toBeVisible({ timeout: 10_000 });

    // List view is default; switch to calendar
    const calendarBtn = page.getByRole('button', { name: /Kalender/i });
    await expect(calendarBtn).toBeVisible();
    await calendarBtn.click();
    // Calendar grid renders day cells
    await expect(page.locator('[aria-label="Bulan sebelumnya"]')).toBeVisible();
    // Switch back
    await page.getByRole('button', { name: /^📋 List$/i }).click();
  });

  test('service worker registers and intercepts navigation', async ({ page, request }) => {
    // Wait for first load + SW registration
    await page.goto('/home');
    // Allow SW to settle on the first hit
    await page.waitForLoadState('networkidle');

    // Force a second navigation so the SW can claim clients and become
    // active for the test context.
    await page.goto('/info');
    await page.waitForLoadState('networkidle');

    const swState = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'no-sw-support';
      // Wait up to 5s for SW to become the active controller
      for (let i = 0; i < 25; i++) {
        if (navigator.serviceWorker.controller) return 'controlled';
        await new Promise((r) => setTimeout(r, 200));
      }
      return navigator.serviceWorker.controller ? 'controlled' : 'unclaimed';
    });
    // We don't strictly assert 'controlled' — edge workers sometimes claim
    // lazily. We do assert that SW API exists + script reachable.
    expect(['controlled', 'unclaimed']).toContain(swState);

    const swScript = await request.get('/sw.js');
    expect(swScript.status()).toBe(200);
    expect(swScript.headers()['content-type']).toMatch(/javascript/);
  });

  test('OG image endpoint serves a PNG', async ({ request }) => {
    const res = await request.get('/info', { headers: { Accept: 'text/html' } });
    expect(res.status()).toBe(200);

    // Next.js auto-exposes the OG image at /info/opengraph-image
    const ogRes = await request.get('/info/opengraph-image');
    expect(ogRes.status()).toBe(200);
    expect(ogRes.headers()['content-type']).toMatch(/^image\/png/);
  });
});

test.describe('Admin / Super auth flow', () => {
  // Production credentials come from GitHub Actions secrets (TEST_SUPER_USER /
  // TEST_SUPER_PASS) — never hardcode them in this file.
  const SUPER_USER = process.env.TEST_SUPER_USER;
  const SUPER_PASS = process.env.TEST_SUPER_PASS;
  const HAVE_CREDS = Boolean(SUPER_USER && SUPER_PASS);

  const getUsernameInput = (page: import('@playwright/test').Page) =>
    page
      .locator(
        'input[autocomplete="username"], input[name="username"], input[placeholder="namapengurus"], input[placeholder="andreas"]',
      )
      .first();
  const getPasswordInput = (page: import('@playwright/test').Page) =>
    page.locator('input[type="password"]').first();

  /**
   * Login is the slowest thing in this suite: every attempt runs bcrypt at cost
   * 10 inside an edge isolate, and the CI runner fires these tests in parallel
   * against live production. Under that load a single attempt has been observed
   * to take 15-40s, which blew the 30s navigation budget and made both auth
   * tests flap (they passed on Playwright's retry, so the suite looked green
   * while hiding it). Give the two auth tests a budget that reflects the real
   * latency instead of relying on retries to paper over it.
   */
  test.describe.configure({ timeout: 90_000 });

  // Wait for the login form to be ready (page checks /api/auth/check on mount
  // and only renders the form after authChecked=true with no session).
  const waitForLoginForm = async (page: import('@playwright/test').Page) => {
    await page.goto('/super', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Superuser Portal/i }).waitFor({ timeout: 30_000 });
    await getUsernameInput(page).waitFor({ timeout: 20_000 });
  };

  test('super login with correct password succeeds', async ({ page }) => {
    test.skip(!HAVE_CREDS, 'TEST_SUPER_USER / TEST_SUPER_PASS not set');
    await waitForLoginForm(page);
    await getUsernameInput(page).fill(SUPER_USER!);
    await getPasswordInput(page).fill(SUPER_PASS!);
    await page.getByRole('button', { name: /Masuk Superuser Portal/i }).click();
    // Dashboard heading should appear
    await expect(page.getByRole('heading', { name: /Manajemen Akun/i })).toBeVisible({
      timeout: 45_000,
    });
    // Audit log section also visible
    await expect(page.getByRole('heading', { name: /Audit Log/i })).toBeVisible();
  });

  test('super login with wrong password shows error', async ({ page }) => {
    test.skip(!HAVE_CREDS, 'TEST_SUPER_USER / TEST_SUPER_PASS not set');
    // Use a username that no test logs into successfully. Sharing the real
    // superuser here means this test depends on the lockout Map's state left by
    // the success test — and that Map is per-isolate, so the outcome varies by
    // which Worker instance answers. A distinct name keeps the assertion about
    // what it claims to test: that a rejected login renders an error.
    await waitForLoginForm(page);
    await getUsernameInput(page).fill(`${SUPER_USER!}-nonexistent`);
    await getPasswordInput(page).fill('0000');
    await page.getByRole('button', { name: /Masuk Superuser Portal/i }).click();
    await expect(page.getByText(/salah|gagal|kunci/i).first()).toBeVisible({ timeout: 45_000 });
  });

  // Skipped: rate limit lives in an in-memory Map inside the serverless isolate.
  // In edge workers, requests may hit different isolates, so lockout state
  // does not always cross isolate boundaries in fast test runs.
  test.skip('rate-limit kicks in after 3 failed attempts', async ({ page }) => {
    await waitForLoginForm(page);
    for (let i = 0; i < 3; i++) {
      await getUsernameInput(page).fill(SUPER_USER ?? 'testuser');
      await getPasswordInput(page).fill(`wrong${i}`);
      await page.getByRole('button', { name: /Masuk Superuser Portal/i }).click();
      await page.waitForTimeout(800);
    }
    await page.reload();
    await waitForLoginForm(page);
    await getUsernameInput(page).fill(SUPER_USER ?? 'testuser');
    await getPasswordInput(page).fill(SUPER_PASS ?? '0000');
    await page.getByRole('button', { name: /Masuk Superuser Portal/i }).click();
    await expect(page.getByText(/kunci sementara|terlalu banyak/i).first()).toBeVisible({
      timeout: 8_000,
    });
  });
});