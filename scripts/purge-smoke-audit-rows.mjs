#!/usr/bin/env node
/**
 * Purge CI smoke-suite residue from the production `audit_log`.
 *
 * WHY: the smoke suite deliberately posts wrong credentials at /api/auth/login
 * to prove the lockout works. Each run wrote 5 rows into the production audit
 * log, and with CI running on every push that reached 85 rows — 36% of the
 * table — in two days. The audit log exists so an operator can answer "is
 * someone trying to break in?". Rows that look exactly like a brute-force
 * attempt but came from our own GitHub runner destroyed that signal.
 *
 * The server now labels such traffic `source = 'smoke'` (see the
 * SMOKE_SOURCE_HEADER block in src/app/api/auth/login/route.ts), so this
 * script's job is one-time cleanup of the rows written before that existed.
 *
 * SEPARATION USES GITHUB'S PUBLISHED RUNNER RANGES.
 *
 * Three earlier approaches were each wrong, and the way they were wrong is the
 * reason this one is written the way it is:
 *
 *   1. `summary LIKE '%smoke%'` — a name is not provenance. It missed the
 *      `__probe__` and `__lockout_probe_*` rows entirely, so real manual test
 *      history would have survived while being sorted as junk.
 *   2. A hand-written list of Azure prefixes — guessing. `130.131.205.84` sat
 *      inside a guessed prefix, and it turned out to genuinely be a runner, so
 *      the guess was wrong in a way that looked convincing on both sides.
 *   3. IP range AND user-agent agreement — the user-agent cannot separate a
 *      runner from a person, because Playwright impersonates desktop Chrome on
 *      purpose. A runner and a real Windows visitor produce byte-identical UA
 *      strings, so the second signal carried no information. Correlation is
 *      not corroboration.
 *
 * The answer is to stop inferring and use the source of truth: GitHub
 * publishes every runner CIDR at https://api.github.com/meta under `actions`.
 * Membership in that list is the definition of a runner, and nothing else is.
 * The list is fetched at run time rather than vendored, so it cannot go stale.
 *
 * Cost of being wrong here is asymmetric, so the default is "keep": a leftover
 * row is harmless, a deleted real login attempt is not.
 *
 * Usage:
 *   node scripts/purge-smoke-audit-rows.mjs            # dry run (default)
 *   node scripts/purge-smoke-audit-rows.mjs --apply    # actually delete
 *
 * Requires CLOUDFLARE_API_TOKEN (Bearer) or CLOUDFLARE_EMAIL +
 * CLOUDFLARE_API_KEY (Global Key), and CLOUDFLARE_ACCOUNT_ID.
 */

import { writeFileSync } from 'node:fs';

const DB_NAME = 'gia-deliksari-db';
// The REST endpoint addresses the database by UUID, not by name.
const DB_ID = process.env.CLOUDFLARE_D1_DATABASE_ID ?? '0f8a9e42-0a14-4a45-9cbb-55f7d8b2f5f1';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_KEY = process.env.CLOUDFLARE_API_KEY;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const EMAIL = process.env.CLOUDFLARE_EMAIL;
const APPLY = process.argv.includes('--apply');

if (!ACCOUNT_ID) {
  console.error('FATAL: CLOUDFLARE_ACCOUNT_ID is not set.');
  process.exit(1);
}
if (!API_TOKEN && !(API_KEY && EMAIL)) {
  console.error('FATAL: set CLOUDFLARE_API_TOKEN, or CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY.');
  process.exit(1);
}

/**
 * GitHub publishes every Actions runner CIDR at api.github.com/meta, under the
 * `actions` key (7038 ranges at the time of writing). Membership in that list
 * is the definition of "a GitHub runner" — no prefix guessing, no user-agent
 * heuristic, and no upkeep when GitHub adds a region.
 *
 * Fetched live rather than vendored so it cannot silently go stale.
 */
async function fetchRunnerNetworks() {
  const res = await fetch('https://api.github.com/meta', {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'gia-audit-purge' },
  });
  if (!res.ok) {
    throw new Error(`Could not fetch api.github.com/meta (HTTP ${res.status})`);
  }
  const meta = await res.json();
  const cidrs = meta?.actions;
  if (!Array.isArray(cidrs) || cidrs.length === 0) {
    throw new Error('api.github.com/meta returned no `actions` ranges — refusing to guess.');
  }
  return cidrs;
}

/**
 * Convert an IPv4 string to a 32-bit integer. Runners are IPv4-only, so an
 * IPv6 address is never a runner and is rejected up front.
 */
function ipv4ToInt(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let out = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    out = out * 256 + n;
  }
  return out;
}

/** Build a matcher from the published CIDR list, without a dependency. */
function buildRunnerMatcher(cidrs) {
  const ranges = [];
  for (const cidr of cidrs) {
    const [base, bitsRaw] = cidr.split('/');
    const bits = Number(bitsRaw);
    const baseInt = ipv4ToInt(base);
    if (baseInt === null || !Number.isInteger(bits)) continue;
    // Precompute the mask so the per-row check is a shift and a compare.
    const mask = bits === 0 ? 0 : (-1 << (32 - bits)) >>> 0;
    ranges.push({ net: (baseInt & mask) >>> 0, mask });
  }
  return (ip) => {
    const value = ipv4ToInt(ip);
    if (value === null) return false;
    for (const { net, mask } of ranges) {
      if (((value & mask) >>> 0) === net) return true;
    }
    return false;
  };
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (API_TOKEN) {
    h.Authorization = `Bearer ${API_TOKEN}`;
  } else {
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
  if (!json.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
  }
  return json.result?.[0]?.results ?? [];
}

/**
 * Find rows that look like smoke traffic. Matching is intentionally broad here
 * — the IP check downstream is what decides. Narrowing the match first would
 * risk missing rows and leaving the table half-cleaned.
 */
async function findCandidateRows() {
  return d1(
    `SELECT id, created_at, action, ip, coalesce(user_agent,'') AS user_agent, substr(summary,1,90) AS summary
       FROM audit_log
      WHERE summary LIKE '%smoke%' OR summary LIKE '%__probe__%'
      ORDER BY created_at ASC`,
  );
}

async function main() {
  console.log(`Purging CI smoke residue from "${DB_NAME}".audit_log`);
  console.log(APPLY ? '>> MODE: APPLY (rows will be deleted)' : '>> MODE: dry run (nothing is deleted)');

  const runnerCidrs = await fetchRunnerNetworks();
  const isRunner = buildRunnerMatcher(runnerCidrs);
  console.log(`Loaded ${runnerCidrs.length} published GitHub Actions ranges from api.github.com/meta.`);

  const candidates = await findCandidateRows();
  if (candidates.length === 0) {
    console.log('No candidate rows. Nothing to do.');
    return;
  }

  const doomed = candidates.filter((r) => isRunner(r.ip));
  const kept = candidates.filter((r) => !isRunner(r.ip));

  console.log(`\nCandidates: ${candidates.length}`);
  console.log(`  source address is a GitHub runner -> delete: ${doomed.length}`);
  console.log(`  anything else                    -> keep  : ${kept.length}`);

  if (kept.length > 0) {
    console.log('\nRows NOT being deleted — source address is not a published runner range:');
    const byKey = new Map();
    for (const r of kept) {
      const ua = r.user_agent.length > 52 ? r.user_agent.slice(0, 52) : r.user_agent;
      const key = `${r.ip}  ||  ${ua || '(no user-agent)'}`;
      const entry = byKey.get(key) ?? { n: 0, sample: r };
      entry.n += 1;
      byKey.set(key, entry);
    }
    for (const [key, { n, sample }] of byKey) {
      console.log(`  ${String(n).padStart(2)}x  ${key}`);
      console.log(`        e.g. ${sample.created_at} ${sample.action} — ${sample.summary.slice(0, 58)}`);
    }
  }

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to delete the runner rows.');
    return;
  }

  // Write a local rollback copy before deleting anything.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `/tmp/gia-audit-purge-rollback-${stamp}.json`;
  writeFileSync(backupPath, JSON.stringify(doomed, null, 2));
  console.log(`\nRollback copy written: ${backupPath}`);

  // Delete by explicit id list — never by re-running the match predicate, so
  // the set that was reviewed is exactly the set that is removed.
  const CHUNK = 50;
  let removed = 0;
  for (let i = 0; i < doomed.length; i += CHUNK) {
    const ids = doomed.slice(i, i + CHUNK).map((r) => `'${r.id}'`).join(',');
    const res = await d1(`DELETE FROM audit_log WHERE id IN (${ids})`);
    removed += ids.split(',').length;
    void res;
  }

  const [after] = await d1(
    `SELECT COUNT(*) AS total FROM audit_log WHERE summary LIKE '%smoke%' OR summary LIKE '%__probe__%'`,
  );
  console.log(`\nDeleted ${removed} rows. Remaining smoke-pattern rows: ${after?.total ?? '?'}.`);
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
