const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const { google } = require('googleapis');
const oauth2 = new google.auth.OAuth2(env.GOOGLE_OAUTH_CLIENT_ID, env.GOOGLE_OAUTH_CLIENT_SECRET, 'http://localhost:1');
oauth2.setCredentials({ refresh_token: env.GOOGLE_OAUTH_REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2 });
(async () => {
  const about = await drive.about.get({ fields: 'user' });
  console.log('Authenticated as:', about.data.user.emailAddress);
  const folderId = env.GOOGLE_DRIVE_NEW_FOLDER_ID;
  const folder = await drive.files.get({ fileId: folderId, fields: 'id,name,mimeType,permissions,capabilities' });
  console.log('Folder name      :', folder.data.name);
  console.log('Folder mime      :', folder.data.mimeType);
  console.log('Folder ID        :', folder.data.id);
  console.log('Capabilities     :', JSON.stringify(folder.data.capabilities, null, 2));
  console.log('Permissions count:', (folder.data.permissions || []).length);
  for (const p of (folder.data.permissions || []).slice(0, 5)) {
    console.log('  -', p.role, '|', p.type, '|', p.emailAddress || p.id);
  }
  // Try to list existing files
  const list = await drive.files.list({
    q: "'" + folderId + "' in parents and trashed = false",
    fields: 'files(id,name,mimeType,size,createdTime)',
    pageSize: 5,
  });
  console.log('Files in folder  :', (list.data.files || []).length);
  for (const f of (list.data.files || []).slice(0, 5)) {
    console.log('  -', f.name, '|', f.mimeType, '|', f.size, 'bytes');
  }
  // Try a tiny test upload
  console.log('\nUploading test file...');
  const testContent = 'oauth-test-' + Date.now();
  const upload = await drive.files.create({
    requestBody: { name: '__oauth_test_' + Date.now() + '.txt', parents: [folderId] },
    media: { mimeType: 'text/plain', body: testContent },
    fields: 'id,name,webViewLink',
  });
  console.log('Upload success   :', upload.data.name, '|', upload.data.id, '|', upload.data.webViewLink);
  // Cleanup
  await drive.files.delete({ fileId: upload.data.id });
  console.log('Cleaned up test file.');
})().catch(e => { console.error('ERROR:', e.message); console.error(JSON.stringify((e.response && e.response.data) || {}, null, 2)); process.exit(1); });
