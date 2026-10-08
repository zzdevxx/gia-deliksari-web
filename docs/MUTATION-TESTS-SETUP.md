# Mutation Tests Setup (GH Actions)

The Playwright **mutation** suite (`tests/e2e/mutations.spec.ts`) writes
to production Cloudflare D1 rows. It's gated by env var so it never
runs accidentally. This guide shows how to enable it in CI.

## Overview

The `mutations` job in `.github/workflows/ci.yml`:

- Runs only on:
  - Commits whose message contains `[mutations]` (escape hatch for branches)
- Requires `TEST_SUPER_USER` and `TEST_SUPER_PASS` GitHub secrets to be set
- Login as superuser with those credentials
- Creates test rows tagged `playwright-test-<timestamp>`
- Verifies CRUD + validation flows
- Skips all mutation tests by default in regular CI runs

## Step 1 — Set the GitHub secrets

1. Go to https://github.com/zzdree/gia-deliksari-web/settings/secrets/actions
2. Ensure both secrets are configured:
   - `TEST_SUPER_USER`: username superuser
   - `TEST_SUPER_PASS`: password superuser
   - For production runs: use the **real** super password (test rows
     are cleaned up automatically after each test)
   - For staging runs: use the staging environment's super password
5. Click **Add secret**

**Don't** commit this password anywhere in the repo.

## Step 2 — Trigger the workflow

### Option A — Manual trigger (recommended)

1. Go to https://github.com/zzdree/gia-deliksari-web/actions/workflows/ci.yml
2. Click **Run workflow**
3. (Optional) Branch selector — default to `main`
4. Click green **Run workflow** button

The `mutations` job runs alongside `typecheck`, `unit`, `audit`, `smoke`.

### Option B — Commit message trigger

Add `[mutations]` to your commit message:

```bash
git commit -m "feat: new schema [mutations]"
git push
```

CI sees the substring `[mutations]` in the commit message and runs the
mutation job. Useful for release-branch validation before deploy.

## Step 3 — Verify it works

After triggering, watch the run at the Actions tab. The mutation job will:

1. Run `npm ci`
2. Install Playwright Chromium
3. Set `RUN_MUTATION_TESTS=1` and `TEST_SUPER_USER=andreas` (default)
4. Run `npx playwright test tests/e2e/mutations.spec.ts`
5. Upload report artifact (always, regardless of pass/fail)

Expected: **5 tests passed** in ~10 seconds.

If a test fails, check the Playwright report artifact (link in the run
summary) for screenshots + traces.

## Step 4 — Override user (optional)

Default uses `TEST_SUPER_USER=andreas`. To use a different test account:

```bash
# In a custom workflow_dispatch with env inputs:
# (requires editing ci.yml to declare the input first)
```

Currently not supported via UI — edit `ci.yml` if needed.

## What gets tested

The mutation suite covers:

| Endpoint | Operations |
|---|---|
| `POST /api/users` | Create + duplicate username → 409 |
| `PATCH /api/users/[id]` | Update roles + display name |
| `DELETE /api/users/[id]` | Soft-deactivate (sets active=false) |
| `POST /api/youth-treasury` | Create transaction |
| `DELETE /api/youth-treasury/[id]` | Hard-delete transaction |
| Validation | amount > 1 milyar → 400 |
| Rate limit | 5 failed logins → 429 (best-effort, isolate memory dependent) |

All test rows are tagged with a timestamp prefix and cleaned up
immediately after each test (delete in the test body).

## When to run

| Scenario | Recommendation |
|---|---|
| Every PR | Don't — too slow, mutates shared DB |
| Every merge to main | Don't — same |
| Release branch prep | Yes — before tagging a release |
| After schema migration | Yes — to verify new API endpoints work |
| Quarterly smoke check | Yes — to catch API contract drift |

## Cleanup

If a test crashes mid-run and leaves orphan rows:

```sql
-- Find orphan test users
SELECT id, username, created_at FROM users
WHERE username LIKE 'playwright-test-%';

-- Find orphan test transactions
SELECT id, description, created_at FROM youth_treasury_transactions
WHERE description LIKE 'playwright-test-% smoke test';

-- Hard delete (or soft-deactivate for users)
DELETE FROM users WHERE username LIKE 'playwright-test-%';
DELETE FROM youth_treasury_transactions WHERE description LIKE 'playwright-test-%';
```

Eksekusi via `wrangler d1 execute gia-deliksari-db --remote --command="..."`.

## Local testing

For local dev, run:

```bash
TEST_SUPER_USER=<user> TEST_SUPER_PASS=<pass> RUN_MUTATION_TESTS=1 npx playwright test tests/e2e/mutations.spec.ts
```

This hits the configured target URL (default `https://giadeliksari.my.id`).