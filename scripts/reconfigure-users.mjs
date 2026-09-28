#!/usr/bin/env node
/**
 * Reconfigure production users to the agreed v2 setup:
 *   - Keep: andreas / 5050 (super)
 *   - Create: zzdree / 9090 (admin + treasurer, multi-role operator)
 *   - Soft-delete: noel (admin), mara (treasurer), tester, temp_x
 *
 * Idempotent: skips users that already match the target state.
 * Run after deploying the multi-role migration.
 *
 * Usage: node scripts/reconfigure-users.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

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
const BCRYPT_COST = 10;

const TARGET_USERS = [
  { username: 'andreas', password: '5050', roles: ['super'],     display_name: 'Andreas (Superuser)' },
  { username: 'zzdree',  password: '9090', roles: ['admin', 'treasurer'], display_name: 'zzdree (Operator)' },
];

const TO_DELETE = ['noel', 'mara', 'tester', 'temp_x'];

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
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  if (prefer.includes('return=representation')) {
    return res.json();
  }
  return null;
}

async function upsertUser({ username, password, roles, display_name }) {
  const existing = await rest(
    'GET',
    `users?select=id,roles,password_hash&username=eq.${encodeURIComponent(username)}&limit=1`,
    null,
    'return=representation',
  );

  if (existing && existing.length > 0) {
    const storedHash = existing[0].password_hash || '';
    const isValidBcrypt = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(storedHash);
    const currentRoles = existing[0].roles || [];

    // Update roles if changed
    const sameRoles =
      currentRoles.length === roles.length &&
      currentRoles.every((r) => roles.includes(r));
    if (!sameRoles) {
      await rest('PATCH', `users?id=eq.${existing[0].id}`, { roles });
      console.log(`  ↻ ${username.padEnd(12)} roles updated: [${currentRoles.join(',')}] → [${roles.join(',')}]`);
    }
    if (!isValidBcrypt) {
      const password_hash = await bcrypt.hash(password, BCRYPT_COST);
      await rest('PATCH', `users?id=eq.${existing[0].id}`, { password_hash });
      console.log(`  ↻ ${username.padEnd(12)} re-hashed (was placeholder)`);
    }
    if (!sameRoles || !isValidBcrypt) {
      return 'updated';
    }
    console.log(`  ↻ ${username.padEnd(12)} already matches target`);
    return 'skipped';
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_COST);
  await rest('POST', 'users', {
    username,
    password_hash,
    roles,
    display_name,
    active: true,
  });
  console.log(`  ✓ ${username.padEnd(12)} (${roles.join('+').padEnd(15)}) inserted`);
  return 'inserted';
}

async function deactivate(username) {
  const path = `users?select=id,active&username=eq.${encodeURIComponent(username)}&limit=1`;
  let data;
  try {
    data = await rest('GET', path, null, 'return=representation');
  } catch (e) {
    console.log(`  ✗ ${username.padEnd(12)} deactivate error: ${e.message}`);
    return;
  }
  if (!data || data.length === 0) {
    console.log(`  ↻ ${username.padEnd(12)} not found, skipping`);
    return;
  }
  if (!data[0].active) {
    console.log(`  ↻ ${username.padEnd(12)} already inactive`);
    return;
  }
  await rest('PATCH', `users?id=eq.${data[0].id}`, { active: false });
  console.log(`  ✓ ${username.padEnd(12)} deactivated`);
}

(async () => {
  console.log('Reconfiguring production users (v2)...');
  console.log('');
  console.log('--- Target users (will upsert) ---');
  for (const u of TARGET_USERS) {
    await upsertUser(u);
  }
  console.log('');
  console.log('--- Users to soft-delete ---');
  for (const u of TO_DELETE) {
    await deactivate(u);
  }
  console.log('');
  console.log('Done. Production users now:');
  console.log('  andreas (super)              — akses penuh ke /super, /admin, /kas');
  console.log('  zzdree  (admin+treasurer)    — akses ke /admin DAN /kas');
  console.log('');
  console.log('Login default (PIN 4 digit):');
  console.log('  Username: andreas,  PIN: 5050  → super');
  console.log('  Username: zzdree,   PIN: 9090  → admin + kas');
})().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});