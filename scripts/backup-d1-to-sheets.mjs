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

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'b3646e9d901e18b382b3f961d2b98f69';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '0f8a9e42-0a14-4a45-9cbb-55f7d8b2f5f1';
const SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
const SYNC_SHEETS = process.env.SYNC_SHEETS !== 'false';

if (!API_TOKEN) {
  console.warn('PERINGATAN: CLOUDFLARE_API_TOKEN belum di-set di environment.');
}

const OUT_DIR = path.resolve(process.cwd(), 'backups', 'd1');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function queryD1(sql) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
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

  let treasury = [];
  let balanceArr = [];
  let announcements = [];
  let rosters = [];
  let inventory = [];

  if (API_TOKEN) {
    [treasury, balanceArr, announcements, rosters, inventory] = await Promise.all([
      queryD1('SELECT * FROM youth_treasury_transactions ORDER BY transaction_date DESC, created_at DESC'),
      queryD1('SELECT * FROM youth_treasury_balance LIMIT 1'),
      queryD1('SELECT * FROM announcements ORDER BY event_date DESC'),
      queryD1('SELECT * FROM servant_rosters ORDER BY service_date DESC'),
      queryD1('SELECT * FROM inventory_items ORDER BY category ASC, code ASC'),
    ]);
  } else {
    console.log('Skipping remote D1 query karena API token belum di-set.');
  }

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
      },
    },
    tables: {
      youth_treasury: treasury,
      youth_balance: balance,
      announcements,
      servant_rosters: rosters,
      inventory_items: inventory,
    },
  };

  // 1. Simpan snapshot file lokal
  const fileDate = timestamp.replace(/[-:T.Z]/g, '').slice(0, 14);
  const filePath = path.join(OUT_DIR, `${fileDate}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`Snapshot berhasil disimpan di: ${filePath}`);

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
