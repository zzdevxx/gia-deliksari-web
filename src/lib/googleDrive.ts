import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Resolve an authorized Drive client.
 *
 * Preferred: OAuth2 refresh token belonging to the CHURCH'S OWN Gmail account
 *   (GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN).
 *   Service accounts have zero personal storage quota since 2021, so any upload
 *   into a normal My Drive fails with 403 "Service Accounts do not have storage
 *   quota". An OAuth token of the real account uploads under its quota and needs
 *   no folder sharing at all.
 *
 * Fallback: service account (read-only capable; uploads will 403 unless the
 *   target is a Shared Drive). Kept so metadata checks still work if configured.
 */
export function getDriveClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      const oauth = new google.auth.OAuth2(clientId, clientSecret);
      oauth.setCredentials({ refresh_token: refreshToken });
      return { drive: google.drive({ version: 'v3', auth: oauth }), mode: 'oauth' as const };
    } catch (error) {
      console.error('Failed to initialize Google Drive OAuth client:', error);
    }
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  // Ensure newline characters in private key are properly formatted
  privateKey = privateKey.replace(/\\n/g, '\n');

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: SCOPES,
    });

    return { drive: google.drive({ version: 'v3', auth }), mode: 'service-account' as const };
  } catch (error) {
    console.error('Failed to initialize Google Drive auth client:', error);
    return null;
  }
}

// SMART FOLDER RESOLUTION (Rolling Cloud Gallery v2)

// Church may have several candidate folders. We probe them in order and use
// the first one the current credentials can WRITE to. This makes the upload
// route resilient whether uploads land in a Shared Drive, a folder that the
// service account has been granted Editor on, or — for OAuth tokens — the
// user's own My Drive.
//
// Priority order:
//   1. GOOGLE_DRIVE_UPLOAD_FOLDER_ID (explicit upload target from env)
//   2. GOOGLE_DRIVE_NEW_FOLDER_ID  (the user's "new" drive archive)
//   3. Any extra folder IDs passed via GOOGLE_DRIVE_FALLBACK_FOLDER_IDS (CSV)
// The probe is cached per-process to avoid an extra round-trip per upload.

const _folderProbeCache: { value: { folderId: string; mode: 'probe' | 'explicit' } | null } = {
  value: null,
};

async function canWriteToFolder(drive: any, folderId: string): Promise<boolean> {
  if (!folderId) return false;
  try {
    // Capability check is cheap and authoritative.
    const r = await drive.files.get({
      fileId: folderId,
      fields: 'capabilities',
      supportsAllDrives: true,
    });
    if (r.data?.capabilities?.canAddChildren) return true;
    // Some folders don't return capabilities for non-shared drives — fall
    // back to a real upload probe with a tiny 0-byte body that we then
    // immediately delete. Wrapped in our own try/catch.
    return await probeUpload(drive, folderId);
  } catch {
    return false;
  }
}

async function probeUpload(drive: any, folderId: string): Promise<boolean> {
  const probeName = `_probe_${Date.now()}.txt`;
  try {
    const created = await drive.files.create({
      requestBody: { name: probeName, parents: [folderId] },
      media: { mimeType: 'text/plain', body: 'probe' },
      fields: 'id',
      supportsAllDrives: true,
    });
    if (created.data?.id) {
      await drive.files
        .delete({ fileId: created.data.id, supportsAllDrives: true })
        .catch(() => undefined);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Resolve which Drive folder a new upload should land in. Cached per process.
 * Returns null if no candidate is writable.
 */
export async function chooseUploadFolder(): Promise<string | null> {
  if (_folderProbeCache.value !== null) return _folderProbeCache.value.folderId;

  const client = getDriveClient();
  if (!client) return null;

  const { drive } = client;

  const candidates: { id: string; source: string }[] = [];
  if (process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID) {
    candidates.push({
      id: process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID,
      source: 'env:GOOGLE_DRIVE_UPLOAD_FOLDER_ID',
    });
  }
  if (process.env.GOOGLE_DRIVE_NEW_FOLDER_ID) {
    candidates.push({
      id: process.env.GOOGLE_DRIVE_NEW_FOLDER_ID,
      source: 'env:GOOGLE_DRIVE_NEW_FOLDER_ID',
    });
  }
  if (process.env.GOOGLE_DRIVE_FALLBACK_FOLDER_IDS) {
    for (const id of process.env.GOOGLE_DRIVE_FALLBACK_FOLDER_IDS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)) {
      if (!candidates.find((c) => c.id === id)) {
        candidates.push({ id, source: 'env:GOOGLE_DRIVE_FALLBACK_FOLDER_IDS' });
      }
    }
  }

  for (const c of candidates) {
    if (await canWriteToFolder(drive, c.id)) {
      _folderProbeCache.value = { folderId: c.id, mode: 'probe' };
      console.log(`[Drive] Upload folder resolved → ${c.id} (${c.source})`);
      return c.id;
    }
  }

  _folderProbeCache.value = null;
  console.warn(
    '[Drive] No writable upload folder found. Service account likely lacks Editor on every candidate.'
  );
  return null;
}

/** Test-only: clear the cached folder probe (used by /api/admin/sync). */
export function _resetFolderProbeCache() {
  _folderProbeCache.value = null;
}

export type DriveUploadResult =
  | { success: true; fileId: string; fileName: string; webViewLink?: string; folderId: string }
  | { success: false; reason?: string; error?: string };

/**
 * Upload a file buffer to Google Drive folder
 */
export async function uploadToGoogleDrive({
  fileName,
  mimeType,
  buffer,
  folderId,
  description,
}: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  folderId?: string;
  description?: string;
}): Promise<DriveUploadResult> {
  const client = getDriveClient();
  if (!client) {
    console.warn('Google Drive credentials not configured, skipping direct Drive upload.');
    return { success: false, reason: 'unconfigured' };
  }

  const { drive } = client;

  // Resolve target folder: explicit > smart probe > legacy env fallback
  let targetFolderId: string | null | undefined = folderId;
  if (!targetFolderId) {
    targetFolderId = await chooseUploadFolder();
  }
  if (!targetFolderId) {
    targetFolderId = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;
  }

  try {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata: { name: string; parents?: string[]; description?: string } = {
      name: fileName,
      description: description || 'Dokumentasi GIA Deliksari Web Portal',
    };

    if (targetFolderId) {
      fileMetadata.parents = [targetFolderId];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: { mimeType, body: stream },
      fields: 'id, name, webViewLink',
      supportsAllDrives: true,
    });

    return {
      success: true,
      fileId: response.data.id!,
      fileName: response.data.name!,
      webViewLink: response.data.webViewLink ?? undefined,
      folderId: targetFolderId || '',
    };
  } catch (error: any) {
    console.error('Google Drive API upload error:', error?.message || error);

    const msg = String(error?.message || '');
    // Detect the two well-known failure modes and return a friendly hint
    if (msg.includes('storage quota') || msg.includes('Service Accounts')) {
      return {
        success: false,
        error:
          'Google menolak upload dari Service Account (tidak punya kuota My Drive). ' +
          'Solusi: (a) share folder target ke service account sebagai Editor, atau ' +
          '(b) jalankan `node scripts/drive-auth-setup.js` untuk membuat OAuth Refresh Token akun Gmail gereja.',
      };
    }
    if (msg.includes('Insufficient permissions') || msg.includes('for the specified parent')) {
      return {
        success: false,
        error:
          'Service account belum di-share sebagai Editor di folder Drive target. ' +
          `Buka folder ${targetFolderId || 'target'} di Drive → Share → tambahkan ` +
          `${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'service account'} sebagai Editor.`,
      };
    }

    return { success: false, error: msg || 'Google Drive upload failed' };
  }
}
