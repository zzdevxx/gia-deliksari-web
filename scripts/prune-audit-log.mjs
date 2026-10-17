#!/usr/bin/env node
/**
 * Prune `audit_log` rows older than a retention window.
 *
 * WHY A SCRIPT AND NOT A CRON JOB
 *
 * The Worker has no `scheduled` export, so the cron entry in wrangler.jsonc is
 * dead configuration and cannot run this. That is the same trap documented in
 * RUNBOOK: a trigger that looks configured but executes nothing. Rather than
 * add a scheduled handler and a deploy to housekeeping, retention runs where a
 * human can see the result — the same model already used for backups.
 *
 * WHY RETENTION AT ALL
 *
 * `audit_log` had no cleanup. It grew by ~5 rows per CI run plus real operator
 * activity, and the backup exported it with `LIMIT 1000` — so once the table
 * passed 1000 rows the oldest entries began vanishing from each snapshot with
 * nothing reporting it. That LIMIT is removed (a snapshot is the whole table or
 * it is not a restore point), which makes retention the thing that keeps growth
 * bounded instead of silent truncation.
 *
 * The retention window is a policy decision, not a technical one: the log
 * contains login attempts with IP addresses, which is personal data under UU
 * PDP. 180 days covers a semester of pastoral follow-up; adjust to whatever the
 * church decides. Pass --days to change it for a single run.
 *
 * Usage:
 *   node scripts/prune-audit-log.mjs                 # dry run, 180-day default
 *   node scripts/prune-audit-log.mjs --days=90       # dry run, 90 days
 *   node scripts/prune-audit-log.mjs --apply         # actually delete
 *
 * Requires CLOUDFLARE_ACCOUNT_ID and either CLOUDFLARE_API_TOKEN (Bearer) or
 * CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY.
 */

import { writeFileSync } from 'node:fs';

const DB_NAME = 'gia-deliksari-db';
const DB_ID = process.env.CLOUDFLARE_D1_DATABASE_ID ?? '0f8a9e42-0a14-4a45-9cbb-55f7d8b2f5f1';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_KEY = process.env.CLOUDFLARE_API_KEY;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const EMAIL = process.env.CLOUDFLARE_EMAIL;

const APPLY = process.argv.includes('--apply');
const daysArg = process.argv.find((a) => a.startsWith('--days='));
const DAYS = daysArg ? Number(daysArg.split('=')[1]) : 180;

if (!Number.isFinite(DAYS) || DAYS < 1) {
  console.error('FATAL: --days must be a positive number.');
  process.exit(1);
}
if (!ACCOUNT_ID) {
  console.error('FATAL: CLOUDFLARE_ACCOUNT_ID is not set.');
  process.exit(1);
}
if (!API_TOKEN && !(API_KEY && EMAIL)) {
  console.error('FATAL: set CLOUDFLARE_API_TOKEN, or CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY.');
  process.exit(1);
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (API_TOKEN) h.Authorization = `Bearer ${API_TOKEN}`;
  else {
    h['X-Auth-Email'] = EMAIL;
    h['X-Auth-Key'] = API_KEY;
  }
  return h;
}

async function d1(sql) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify({ sql }) },
  );
  const json = await res.json();
  if (!json.success) throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
  return json.result?.[0]?.results ?? [];
}

async function main() {
  // Cut-off computed against a UTC "now" minus the window. ISO strings in this
  // table are UTC (`toISOString`), and SQLite compares them lexicographically,
  // which is correct for this format as long as both sides are UTC.
  const cutoff = new Date(Date.now() - DAYS * 86_400_000).toISOString();

  console.log(`audit_log retention: ${DAYS} days (cut-off ${cutoff})`);
  console.log(APPLY ? '>> MODE: APPLY (rows will be deleted)' : '>> MODE: dry run (nothing is deleted)');

  const [before] = await d1('SELECT COUNT(*) AS n FROM audit_log');
  const [expired] = await d1(
    `SELECT COUNT(*) AS n FROM audit_log WHERE created_at < '${cutoff}'`,
  );
  const [protectedRow] = await d1(
    `SELECT COUNT(*) AS n FROM audit_log WHERE created_at < '${cutoff}'
       AND (action = 'user.create' OR action = 'user.password_change'
            OR action = 'user.deactivate' OR action = 'user.update')`,
  );

  console.log(`\nTotal rows      : ${before?.n ?? '?'}`);
  console.log(`Older than ${DAYS}d : ${expired?.n ?? '?'}`);
  console.log(`  of which user-management events: ${protectedRow?.n ?? 0}`);

  // User-management events are the audit trail for who granted whom access.
  // Pruning them on a timer would erase accountability history that no other
  // record holds, so they are excluded from deletion regardless of age. If the
  // church ever wants them gone, that should be an explicit decision with a
  // named person making it, not a side effect of a nightly cleanup.
  const doomed = await d1(
    `SELECT id, created_at, action FROM audit_log
      WHERE created_at < '${cutoff}'
        AND action NOT IN ('user.create','user.update','user.deactivate','user.password_change')
      ORDER BY created_at ASC`,
  );

  if (doomed.length === 0) {
    console.log('\nNothing to prune. Done.');
    return;
  }

  if (!APPLY) {
    console.log(`\nWould delete ${doomed.length} rows, oldest ${doomed[0]?.created_at}.`);
    console.log('Dry run complete. Re-run with --apply to delete.');
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `/tmp/gia-audit-prune-rollback-${stamp}.json`;
  writeFileSync(backupPath, JSON.stringify(doomed, null, 2));
  console.log(`\nRollback copy: ${backupPath}`);

  const CHUNK = 50;
  let removed = 0;
  for (let i = 0; i < doomed.length; i += CHUNK) {
    const ids = doomed.slice(i, i + CHUNK).map((r) => `'${r.id}'`).join(',');
    await d1(`DELETE FROM audit_log WHERE id IN (${ids})`);
    removed += Math.min(CHUNK, doomed.length - i);
  }

  const [after] = await d1('SELECT COUNT(*) AS n FROM audit_log');
  console.log(`Deleted ${removed} rows. audit_log now holds ${after?.n ?? '?'}.`);
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
