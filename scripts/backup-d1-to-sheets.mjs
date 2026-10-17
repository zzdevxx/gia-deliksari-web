#!/usr/bin/env node
/**
 * D1 Backup & Google Sheets Webhook Dispatcher
 *
 * Mengambil snapshot data dari Cloudflare D1 via REST API:
 *   - youth_treasury_transactions + youth_treasury_balance
 *   - announcements
 *   - servant_rosters
 *   - inventory_items
 *
 * Menyimpan snapshot lokal ke backups/d1/YYYYMMDD_HHMMSS.json
 * dan meneruskan payload ke Google Apps Script Web App untuk Google Sheets.
 */
import fs from 'node:fs';
import path from 'node:path';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '0f8a9e42-0a14-4a45-9cbb-55f7d8b2f5f1';
const SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
const SYNC_SHEETS = process.env.SYNC_SHEETS !== 'false';

/**
 * Refuse to run without credentials.
 *
 * This script used to warn and continue when CLOUDFLARE_API_TOKEN was absent,
 * which meant every scheduled run wrote a snapshot whose every table was empty
 * and every count zero — then committed it. A backup that silently succeeds
 * while capturing nothing is worse than no backup: it looks like coverage in
 * the git history while the real data was never copied. Missing credentials are
 * a configuration error, not a soft condition.
 */
if (!ACCOUNT_ID) {
  console.error(
    'FATAL: CLOUDFLARE_ACCOUNT_ID wajib di-set. Tanpa itu query akan menuju akun ' +
      'yang salah (atau gagal), jadi backup dibatalkan alih-alih menulis snapshot palsu.',
  );
  process.exit(1);
}

const OUT_DIR = path.resolve(process.cwd(), 'backups', 'd1');
fs.mkdirSync(OUT_DIR, { recursive: true });

/**
 * Two ways to authenticate, because the two environments differ:
 *   - CI uses a scoped API Token (`Bearer`), which is the right thing to hold
 *     as a repo secret — it can be revoked and limited to D1:Read.
 *   - A workstation has a Global API Key, which is NOT a Bearer token; it goes
 *     in `X-Auth-Email` + `X-Auth-Key`. Supporting it lets a maintainer run and
 *     verify this script locally without minting a second credential.
 * Prefer the token when both are present.
 */
function authHeaders() {
  if (API_TOKEN) return { Authorization: `Bearer ${API_TOKEN}` };
  const email = process.env.CLOUDFLARE_EMAIL;
  const globalKey = process.env.CLOUDFLARE_API_KEY || process.env.CLOUDFLARE_GLOBAL_KEY;
  if (email && globalKey) return { 'X-Auth-Email': email, 'X-Auth-Key': globalKey };
  console.error(
    'FATAL: tidak ada kredensial Cloudflare. Set CLOUDFLARE_API_TOKEN (disarankan), ' +
      'atau CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY untuk pemakaian lokal.',
  );
  process.exit(1);
}

async function queryD1(sql) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`D1 query failed HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (!json.success || !json.result?.[0]?.results) {
    throw new Error(`D1 API error: ${JSON.stringify(json.errors || json)}`);
  }
  return json.result[0].results;
}

async function main() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Memulai backup Cloudflare D1 (${DATABASE_ID})...`);

  const [
    treasury,
    balanceArr,
    announcements,
    rosters,
    inventory,
    sermons,
    gallery,
    ministryRequests,
    users,
    auditLog,
  ] = await Promise.all([
    queryD1('SELECT * FROM youth_treasury_transactions ORDER BY transaction_date DESC, created_at DESC'),
    queryD1('SELECT * FROM youth_treasury_balance LIMIT 1'),
    queryD1('SELECT * FROM announcements ORDER BY event_date DESC'),
    queryD1('SELECT * FROM servant_rosters ORDER BY service_date DESC'),
    queryD1('SELECT * FROM inventory_items ORDER BY category ASC, code ASC'),
    queryD1('SELECT * FROM sermons ORDER BY created_at DESC'),
    queryD1('SELECT * FROM gallery_items ORDER BY created_at DESC'),
    queryD1('SELECT * FROM ministry_requests ORDER BY created_at DESC'),
    queryD1('SELECT id, username, roles, display_name, active, last_login_at, created_at FROM users ORDER BY created_at ASC'),
    // No LIMIT. This was `LIMIT 1000`, which is not a backup — it is a backup
    // with a silent expiry date. The table grows by roughly 5 rows per CI run
    // and there is no retention yet, so within weeks the oldest rows would
    // start disappearing from each new snapshot with no warning: the same
    // fail-silent shape as the empty-snapshot bug this script already fixed.
    // A snapshot is either the whole table or it is not a restore point.
    queryD1('SELECT * FROM audit_log ORDER BY created_at DESC'),
  ]);

  const balance = balanceArr[0] || { total_income: 0, total_expense: 0, balance: 0 };

  const snapshot = {
    _meta: {
      exported_at: timestamp,
      database_id: DATABASE_ID,
      counts: {
        treasury: treasury.length,
        announcements: announcements.length,
        rosters: rosters.length,
        inventory: inventory.length,
        sermons: sermons.length,
        gallery: gallery.length,
        ministry_requests: ministryRequests.length,
        users: users.length,
        audit_log: auditLog.length,
      },
    },
    tables: {
      youth_treasury: treasury,
      youth_balance: balance,
      announcements,
      servant_rosters: rosters,
      inventory_items: inventory,
      sermons,
      gallery_items: gallery,
      ministry_requests: ministryRequests,
      users,
      audit_log: auditLog,
    },
  };

  // Guard against the silent-empty failure mode this script shipped with: a
  // snapshot where every table is empty is almost always a bad token, a wrong
  // database id, or a scoped-down API key — not a genuinely empty church DB.
  // The portal is live and serves announcements, so refuse to record "nothing".
  const totalRows =
    treasury.length + announcements.length + rosters.length + inventory.length +
    sermons.length + gallery.length + ministryRequests.length + users.length + auditLog.length;
  if (totalRows === 0) {
    console.error(
      'FATAL: snapshot kosong (0 baris di semua tabel). Ini hampir selalu berarti ' +
        'token/DB id salah, bukan database yang benar-benar kosong. Backup dibatalkan.',
    );
    process.exit(1);
  }

  // The check above only fires when EVERY table is empty, which is the least
  // likely shape of the real failure. A token scoped to one table, or a query
  // that errors on one table while the rest succeed, produces a snapshot that
  // is mostly fine — and the sum stays comfortably above zero.
  //
  // That is not hypothetical: commit a5893c0 fixed a backup that wrote
  // all-empty snapshots for weeks and exited 0. The global-sum guard closes the
  // all-empty case and leaves the partial case open. A snapshot missing `users`
  // is the dangerous one — it is the table a restore needs to let anyone log
  // back in — and it would be committed nightly while every count looked busy.
  //
  // These tables must never be empty in a healthy database and are small enough
  // that their being empty always means something is wrong. Tables like
  // `gallery` and `youth_treasury_transactions` are legitimately empty today,
  // so they are deliberately not listed: a guard that cries wolf gets ignored.
  const MUST_NOT_BE_EMPTY = [
    ['users', users.length],
    ['announcements', announcements.length],
  ];
  const empties = MUST_NOT_BE_EMPTY.filter(([, n]) => n === 0).map(([name]) => name);
  if (empties.length > 0) {
    console.error(
      `FATAL: tabel kritis kosong pada snapshot: ${empties.join(', ')}. ` +
        'Database produksi tidak pernah kosong di tabel ini, jadi ini menandakan ' +
        'query gagal atau token kehilangan scope — bukan data yang benar-benar kosong. ' +
        'Backup dibatalkan supaya snapshot cacat tidak ter-commit.',
    );
    process.exit(1);
  }

  // 1. Simpan snapshot file lokal
  const fileDate = timestamp.replace(/[-:T.Z]/g, '').slice(0, 14);
  const filePath = path.join(OUT_DIR, `${fileDate}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`Snapshot berhasil disimpan di: ${filePath} (${totalRows} baris)`);

  // 2. Kirim ke Google Apps Script Webhook
  if (SYNC_SHEETS && SHEETS_WEBHOOK_URL) {
    console.log('Mengirim data ke Google Apps Script Webhook...');
    try {
      const payload = {
        secret: WEBHOOK_SECRET || '',
        timestamp,
        data: snapshot.tables,
      };

      const webhookRes = await fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!webhookRes.ok) {
        const errText = await webhookRes.text();
        console.warn(`Webhook Google Sheets ditolak (HTTP ${webhookRes.status}): ${errText}`);
      } else {
        const webhookJson = await webhookRes.json().catch(() => ({}));
        console.log('Respon Google Sheets sync:', webhookJson);
      }
    } catch (err) {
      console.warn('Gagal menghubungi Webhook Google Sheets:', err.message);
    }
  } else {
    console.log('Google Sheets Webhook dilewati (belum ada GOOGLE_SHEETS_WEBHOOK_URL).');
  }

  console.log('Backup D1 selesai.');
}

main().catch((err) => {
  console.error('FATAL backup error:', err);
  process.exit(1);
});
