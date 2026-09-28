/**
 * One-shot OAuth token exchange.
 * Usage: node scripts/exchange-oauth-code.js "<code>"
 */
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env.local');

function loadEnv(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const code = process.argv[2];
  if (!code) {
    console.error('Usage: node scripts/exchange-oauth-code.js "<code>"');
    process.exit(1);
  }

  const env = loadEnv(ENV_PATH);
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = 'http://localhost:1';
  if (!clientId || !clientSecret) {
    console.error('Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  const body = new URLSearchParams({
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirectUri, grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('TOKEN EXCHANGE FAILED');
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log('Token response keys:', Object.keys(json).join(', '));
  console.log('  access_token :', json.access_token ? json.access_token.slice(0, 24) + '...' : 'MISSING');
  console.log('  refresh_token:', json.refresh_token ? json.refresh_token.slice(0, 24) + '...' : 'MISSING');
  console.log('  expires_in   :', json.expires_in);
  console.log('  scope        :', json.scope);
  console.log('  token_type   :', json.token_type);

  if (!json.refresh_token) {
    console.error('\nNo refresh_token in response. Regenerate consent URL with prompt=consent + access_type=offline');
    process.exit(2);
  }

  const original = fs.readFileSync(ENV_PATH, 'utf8');
  const newLine = 'GOOGLE_OAUTH_REFRESH_TOKEN="' + json.refresh_token + '"';
  let updated;
  if (/^GOOGLE_OAUTH_REFRESH_TOKEN=/m.test(original)) {
    updated = original.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m, newLine);
  } else {
    updated = original.replace(/\s*$/, '') + '\n' + newLine + '\n';
  }
  fs.writeFileSync(ENV_PATH, updated);
  console.log('\nSaved GOOGLE_OAUTH_REFRESH_TOKEN to .env.local');

  const meRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
    headers: { Authorization: 'Bearer ' + json.access_token },
  });
  const me = await meRes.json();
  if (meRes.ok) {
    console.log('Drive auth OK. Authenticated as:', me.user && (me.user.emailAddress || me.user.displayName));
  } else {
    console.warn('Drive about call failed:', meRes.status, JSON.stringify(me));
  }
}

main().catch((e) => { console.error('Unexpected error:', e); process.exit(99); });
