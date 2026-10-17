import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Vitest config for component-level mutation tests.
 *
 * Runs jsdom + RTL. Fast feedback loop (no network, no Playwright).
 * Path alias matches tsconfig.json so imports of @/components/* work.
 *
 * `__dirname` is deliberately not used. Node 22 (the CI runtime) loads this
 * file as CommonJS, so `__dirname` happens to exist there; Node 24 refuses
 * that load with "ESM syntax in a file loaded as CommonJS" and runs ZERO tests
 * while still exiting 0. That is the same silent-pass shape as the ZZLUXORA
 * suite that reported OK without collecting anything: a green result that
 * verified nothing. `import.meta.url` is valid under both loaders, so the
 * alias resolves on either Node version.
 */
const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./tests/unit/setup.tsx'],
    css: false, // tailwind classes are static; no need to compile them for unit tests
    // Refuse to report success when no test file was collected. Without this a
    // config that fails to load is indistinguishable from a passing suite.
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(here, './src'),
    },
  },
});
