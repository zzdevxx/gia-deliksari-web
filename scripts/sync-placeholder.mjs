#!/usr/bin/env node
/**
 * Sync production DB to placeholder state.
 *
 * What this does:
 *   1. Deletes ALL announcements + servant_rosters rows (admin will re-add real data)
 *   2. Inserts one placeholder announcement: "Selamat Datang di GIA Deliksari"
 *   3. Inserts one placeholder roster entry (future-dated so it doesn't show as "upcoming")
 *
 * Idempotent: safe to re-run.
 *
 * Usage:
 *   node scripts/sync-placeholder.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
const envMap = Object.fromEntries(
  envLocal
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);

const SUPABASE_URL = envMap.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = envMap.SUPABASE_SERVICE_ROLE_KEY;

async function rest(method, path, body = null, prefer = 'return=representation') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 250)}`);
  }
  if (prefer.includes('return=representation')) {
    return res.json();
  }
  return null;
}

async function deleteAll(table) {
  // Use 'neq' filter on a non-null column to delete all rows
  await rest('DELETE', `${table}?id=neq.00000000-0000-0000-0000-000000000000`);
}

(async () => {
  console.log('Wiping announcements + servant_rosters to placeholder state...');

  await deleteAll('announcements');
  console.log('  ✓ all announcements deleted');

  await deleteAll('servant_rosters');
  console.log('  ✓ all servant_rosters deleted');

  // Insert placeholder announcement (no end_date — column not in production schema)
  await rest(
    'POST',
    'announcements',
    {
      title: 'Selamat Datang di GIA Deliksari',
      category: 'general',
      content:
        'Portal informasi resmi jemaat GIA Deliksari Semarang. Warta jemaat dan jadwal pelayanan akan ditampilkan di sini setelah pengurus gereja menginputnya melalui Portal Admin.',
      event_date: '2099-12-31',
      is_pinned: false,
      is_published: true,
      badge_text: 'Placeholder',
      author: 'Tim Media GIA Deliksari',
    },
    'return=representation',
  );
  console.log('  ✓ placeholder announcement inserted');

  // Insert placeholder roster
  await rest(
    'POST',
    'servant_rosters',
    {
      service_category: 'general',
      service_date: '2099-12-31',
      role: '(Placeholder)',
      servant_name: '(Belum ada petugas terjadwal)',
      phone: null,
      status: 'pending',
      notes: 'Placeholder. Akan diisi oleh admin melalui Portal Admin.',
    },
    'return=representation',
  );
  console.log('  ✓ placeholder roster inserted');

  console.log('\nDone. Production DB is now in placeholder state — admin fills real data via /admin.');
})().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});