#!/usr/bin/env node
/**
 * Backup Supabase ke JSON file.
 * Dipanggil dari .github/workflows/daily-backup.yml.
 *
 * Env vars yang dibutuhkan:
 *   SUPABASE_URL        — https://<project-ref>.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role key (RAHASIA, bypass RLS)
 *
 * Output: backups/YYYYMMDDHHMMSS.json
 *
 * Skema Supabase project saat ini (6 tabel):
 *   - announcements
 *   - gallery_items
 *   - sermons
 *   - ministry_requests
 *   - servant_rosters
 *   - inventory_items
 *
 * Tabel lain yang tercantum di DEFAULT_TABLES tapi belum dibuat di Supabase
 * akan di-skip dengan warning (HTTP 404). Workflow exit 0 selama minimal
 * 1 tabel berhasil di-backup.
 */
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const DEFAULT_TABLES = [
  // Existing tables (verified ada di Supabase)
  'announcements',
  'gallery_items',
  'sermons',
  'ministry_requests',
  'servant_rosters',
  'inventory_items',
  // Planned tables (belum dibuat — akan di-skip jika 404)
  'profiles',
  'events',
  'bible_study_registrations',
  'small_groups',
  'small_group_members',
];

const TABLES = process.env.BACKUP_TABLES
  ? process.env.BACKUP_TABLES.split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_TABLES;

const PAGE_SIZE = 1000;
const OUT_DIR = path.resolve(process.cwd(), 'backups');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL dan SUPABASE_SERVICE_KEY harus di-set');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

async function fetchAll(table) {
  const all = [];
  let offset = 0;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact',
      },
    });
    if (!res.ok) {
      const err = await res.text();
      const errMsg = `HTTP ${res.status} untuk ${table}: ${err.substring(0, 200)}`;
      // Tandai 404 sebagai "skip-able" (tabel belum dibuat)
      if (res.status === 404) {
        const skipErr = new Error(errMsg);
        skipErr.skip = true;
        throw skipErr;
      }
      throw new Error(errMsg);
    }
    const rows = await res.json();
    if (!Array.isArray(rows)) {
      throw new Error(`Response bukan array untuk ${table}`);
    }
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    if (offset > 50 * PAGE_SIZE) {
      console.warn(`[${table}] cap 50k baris tercapai`);
      break;
    }
  }
  return all;
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`[${startedAt}] Mulai backup ${TABLES.length} tabel...`);

  const snapshot = {
    _meta: {
      exported_at: startedAt,
      supabase_url: SUPABASE_URL.replace(/\/$/, '').replace(/^https?:\/\//, ''),
      table_count: TABLES.length,
      tool: 'gia-deliksari-web/scripts/backup-supabase.mjs',
    },
    tables: {},
  };

  const failed = [];
  const skipped = [];
  let successCount = 0;

  for (const t of TABLES) {
    try {
      const rows = await fetchAll(t);
      snapshot.tables[t] = rows;
      console.log(`  ✓ ${t}: ${rows.length} baris`);
      successCount++;
    } catch (err) {
      if (err.skip) {
        console.warn(`  ⊘ ${t}: SKIP (tabel belum ada di Supabase)`);
        skipped.push({ table: t, reason: 'not_found' });
      } else {
        console.error(`  ✗ ${t}: ${err.message}`);
        failed.push({ table: t, error: err.message });
      }
    }
  }

  snapshot._meta.failed_tables = failed;
  snapshot._meta.skipped_tables = skipped;
  snapshot._meta.total_rows = Object.values(snapshot.tables)
    .reduce((s, r) => s + (Array.isArray(r) ? r.length : 0), 0);

  const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
  const outFile = path.join(OUT_DIR, `${ts}.json`);
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2));

  console.log(`[DONE] Disimpan ke ${outFile}`);
  console.log(`       Berhasil: ${successCount}, Skip: ${skipped.length}, Gagal: ${failed.length}`);
  console.log(`       Total baris tersimpan: ${snapshot._meta.total_rows}`);

  // Exit logic:
  //  - 0 jika minimal 1 tabel berhasil (backup sebagian tetap berguna)
  //  - 1 jika SEMUA tabel gagal (kemungkinan besar kredensial / network error)
  //  - Skip (404) tidak dihitung sebagai failure
  if (successCount === 0) {
    fs.writeFileSync('backup-error.log',
      `Backup GAGAL TOTAL: tidak ada tabel yang berhasil.\n${JSON.stringify(failed, null, 2)}`);
    console.error('FATAL: Semua tabel gagal, cek kredensial Supabase');
    process.exit(1);
  }

  if (failed.length > 0) {
    // Sebagian gagal (bukan skip) → tulis warning tapi jangan fail workflow
    fs.writeFileSync('backup-error.log',
      `Backup selesai dengan sebagian error (bukan skip):\n${JSON.stringify(failed, null, 2)}`);
    console.warn(`WARNING: ${failed.length} tabel gagal (selain ${skipped.length} yang di-skip)`);
    process.exit(0); // tetap exit 0 karena sebagian besar berhasil
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  fs.writeFileSync('backup-error.log', err.stack || err.message);
  process.exit(1);
});
