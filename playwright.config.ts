import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for smoke tests.
 *
 * Targets the production deployment (gia-deliksari-web.vercel.app) by default,
 * so we exercise the real path through Vercel CDN + Supabase + Drive. Override
 * with `BASE_URL=http://localhost:3000` to test against local dev server.
 *
 * Tests live in tests/e2e/. Add new spec files there as needed.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: process.env.BASE_URL ?? 'https://gia-deliksari-web.zzdree.workers.dev',
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