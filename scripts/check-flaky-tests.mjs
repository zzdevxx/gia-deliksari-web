#!/usr/bin/env node
/**
 * Fail the job when any Playwright test passed only on a retry.
 *
 * WHY THIS EXISTS
 *
 * Playwright retries exist to absorb transient network conditions. The problem
 * is that a retry also absorbs transient DEFECTS, and its default exit code
 * treats the two identically: a test that fails twice and passes the third time
 * is reported as "1 flaky" and the process exits 0.
 *
 * On 16 Oct 2026 that obscured a real production fault. The smoke job reported
 * "1 flaky" and went green in the same window that /media was returning 503 to
 * visitors. Nobody acted, because a green check reads as "fine".
 *
 * The distinction this script draws:
 *   - Passed first try        -> healthy.
 *   - Passed only on a retry  -> unreliable. FAIL the job.
 *   - Never passed            -> broken. Already fails via Playwright's own code.
 *
 * Rationale: for a site whose visitors are on mobile connections, "the request
 * needed a retry" is genuinely worth surfacing, not suppressing. If a specific
 * test is legitimately slow, raise its timeout — do not let retries mask it.
 *
 * Reads the JSON report written by playwright.config.ts
 * (`test-results/results.json`). Missing report is a hard error: silently
 * passing when the artefact is absent would recreate the exact blind spot this
 * script was written to close.
 */

import { readFileSync, existsSync } from 'node:fs';

const REPORT = 'test-results/results.json';

if (!existsSync(REPORT)) {
  console.error(`FATAL: ${REPORT} not found.`);
  console.error('The smoke job must write a JSON report for the flaky check to work.');
  console.error('Verify the `json` reporter is listed in playwright.config.ts.');
  process.exit(1);
}

let report;
try {
  report = JSON.parse(readFileSync(REPORT, 'utf8'));
} catch (err) {
  console.error(`FATAL: could not parse ${REPORT}: ${err.message}`);
  process.exit(1);
}

/**
 * Walk every spec file -> suite -> test, collecting tests whose final status is
 * "passed" but that needed more than one attempt. Playwright records this as
 * `status: 'flaky'` for the test itself, but we also check `results.length`
 * because a retried test can carry a mix of statuses across attempts.
 */
const flaky = [];
const walk = (suite, filePath) => {
  const file = suite.file ?? filePath;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const attempts = test.results ?? [];
      const last = attempts[attempts.length - 1];
      const passedEventually = last?.status === 'passed' || test.status === 'flaky';
      if (passedEventually && attempts.length > 1) {
        const failures = attempts.filter((a) => a.status !== 'passed').length;
        flaky.push({
          title: `${spec.title} > ${test.projectName ?? ''}`.trim(),
          file,
          attempts: attempts.length,
          failures,
          firstError: attempts.find((a) => a.error?.message)?.error?.message?.split('\n')[0] ?? '',
        });
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child, file);
};

for (const suite of report.suites ?? []) walk(suite, report.config?.rootDir);

if (flaky.length === 0) {
  console.log('OK: no test required a retry. Every result was first-attempt.');
  process.exit(0);
}

console.error('');
console.error('='.repeat(74));
console.error(`FAIL: ${flaky.length} test(s) passed only after a retry.`);
console.error('='.repeat(74));
console.error('');
console.error('A pass-on-retry means the code path is unreliable. The CI runner is');
console.error('not the visitor: real users on mobile connections will hit whatever');
console.error('made this need a second attempt, and they do not get a retry.');
console.error('');
for (const t of flaky) {
  console.error(`  • ${t.title}`);
  console.error(`    file    : ${t.file}`);
  console.error(`    attempts: ${t.attempts} (${t.failures} failed first)`);
  if (t.firstError) console.error(`    first   : ${t.firstError}`);
  console.error('');
}
console.error('If the test is legitimately slow, raise its timeout in the spec.');
console.error('If it is racing, fix the race. Do not rely on the retry.');
console.error('');

process.exit(1);
