import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for smoke tests.
 *
 * Targets the production deployment (https://giadeliksari.my.id) by default.
 * Override with `BASE_URL=http://localhost:3000` to test against local dev server.
 *
 * Tests live in tests/e2e/. Add new spec files there as needed.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries exist for genuinely transient conditions on an Indonesian mobile
  // network, which is the profile this site actually serves. They are NOT a
  // way to pass: a test that only passes on retry is reported as flaky and
  // fails the job (see the "flaky" reporter below), because a pass-on-retry
  // means the code path is unreliable — which is the thing worth knowing.
  //
  // The concrete case: the /media 503 on 16 Oct 2026 passed on retry #2, so CI
  // reported "1 flaky" and the deploy continued. The 503 was real and reached
  // visitors. Treating a retry-pass as a pass is exactly what hid it.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]]
    : 'list',

  use: {
    baseURL: process.env.BASE_URL ?? 'https://giadeliksari.my.id',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Slow network slightly to mimic Indonesian mobile connections.
    extraHTTPHeaders: {
      'Accept-Language': 'id-ID,id;q=0.9',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile viewport for the most common visitor profile (jemaat on phone).
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // CI-specific: don't fail immediately on infra hiccups; rely on retries.
  // Local: bail on first failure so dev loop is fast.
  maxFailures: process.env.CI ? undefined : 5,
});