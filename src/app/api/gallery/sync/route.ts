import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { queryAll, execute } from '@/lib/d1';
import { getDriveClient } from '@/lib/googleDrive';
import { requireRole, type User } from '@/lib/auth';
import { logAudit, auditContextFromRequest } from '@/lib/auditLog';
import { driveUnavailable } from '@/lib/httpErrors';

export async function POST(req: NextRequest) {
  const syncSecret = process.env.GALLERY_SYNC_SECRET;
  const providedSecret = req.headers.get('x-sync-secret');
  let isAuthed = false;
  let actor: User | null = null;

  if (syncSecret && providedSecret) {
    const a = Buffer.from(providedSecret);
    const b = Buffer.from(syncSecret);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      isAuthed = true;
    }
  }

  if (!isAuthed) {
    const guard = await requireRole(req, ['super', 'admin']);
    if (!(guard instanceof Response)) {
      isAuthed = true;
      actor = guard;
    }
  }

  if (!isAuthed) {
    return NextResponse.json(
      { error: 'Akses ditolak. Butuh admin session yang valid atau sync secret.' },
      { status: 401 },
    );
  }

  const folderId = process.env.GOOGLE_DRIVE_PUBLIC_FOLDER_ID;
  if (!folderId) {
    return driveUnavailable('folder_id_unset', 'GOOGLE_DRIVE_PUBLIC_FOLDER_ID belum di-set di environment.');
  }

  const client = getDriveClient();
  if (!client) {
    return driveUnavailable('drive_client_unconfigured', 'Google Drive client belum dikonfigurasi.');
  }

  const { drive } = client;

  let added = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    const list = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, createdTime, description)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });

    const driveFiles = list.data.files ?? [];
    if (driveFiles.length === 0) {
      return NextResponse.json({ success: true, added: 0, skipped: 0, message: 'Tidak ada foto di folder Drive.' });
    }

    const existingRows = await queryAll<{ drive_file_id: string }>(
      'SELECT drive_file_id FROM gallery_items WHERE drive_file_id IS NOT NULL',
    );
    const existingIds = new Set(existingRows.map((r) => r.drive_file_id));

    let ctx: any = null;
    try { ctx = await getCloudflareContext({ async: true }); } catch {
      // Absent when this route runs outside the Workers runtime (tests, builds).
      // The caller below handles a null context rather than failing here.
    }

    for (const file of driveFiles) {
      if (!file.id || existingIds.has(file.id)) {
        skipped++;
        continue;
      }

      try {
        // Drive's image CDN, not the /thumbnail preview endpoint. The preview
        // endpoint rate-limits and sometimes answers with HTML instead of bytes,
        // which left gallery tiles blank. This is the no-R2 serving path and it
        // is the expected one for this project (R2 needs a payment method).
        let imageUrl = `https://lh3.googleusercontent.com/d/${file.id}=w2000`;
        let thumbUrl = `https://lh3.googleusercontent.com/d/${file.id}=w800`;

        if (ctx?.env?.GALLERY_BUCKET) {
          try {
            const dlRes = await drive.files.get(
              { fileId: file.id, alt: 'media' },
              { responseType: 'arraybuffer' },
            );
            const buffer = Buffer.from(dlRes.data as ArrayBuffer);
            const ext = (file.mimeType?.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
            const fileName = `synced_${file.id}_${Date.now()}.${ext}`;

            await ctx.env.GALLERY_BUCKET.put(`public/${fileName}`, buffer, {
              httpMetadata: { contentType: file.mimeType || 'image/jpeg' },
            });
            const base = ctx.env.R2_PUBLIC_URL || 'https://gallery.giadeliksari.org';
            imageUrl = `${base}/public/${fileName}`;
            thumbUrl = imageUrl;
          } catch (r2Err) {
            console.warn('[gallery/sync] R2 sync error, using drive thumb:', r2Err);
          }
        }

        const desc = file.description || '';
        const titleMatch = desc.match(/Judul:\s*([^|]+)/);
        const categoryMatch = desc.match(/Kategori:\s*([^|]+)/);
        const uploaderMatch = desc.match(/Diunggah oleh:\s*([^|]+)/);
        const dateMatch = desc.match(/Tanggal:\s*([^|]+)/);

        const title = (titleMatch?.[1] || file.name || 'Dokumentasi Jemaat').trim();
        const categoryRaw = (categoryMatch?.[1] || 'umum').trim().toLowerCase();
        const validCategories = ['ibadah', 'worship', 'youth', 'komunitas', 'umum'];
        const category = validCategories.includes(categoryRaw) ? categoryRaw : 'umum';
        const uploaderName = (uploaderMatch?.[1] || 'Jemaat').trim();
        const date = (dateMatch?.[1] || new Date(file.createdTime || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })).trim();

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        await execute(
          `INSERT INTO gallery_items (
            id, title, category, image, thumb_url, drive_file_id, drive_web_view_link, uploader_name, is_published, date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
          [
            id,
            title,
            category,
            imageUrl,
            thumbUrl,
            file.id,
            file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
            uploaderName,
            date,
            now,
          ],
        );

        added++;
      } catch (fileErr: any) {
        errors.push(`${file.name}: ${fileErr.message || 'unknown error'}`);
      }
    }

    await logAudit({
      actor,
      action: 'gallery.upload',
      summary: `Sync Drive→D1 selesai: ${added} baru, ${skipped} skip, ${driveFiles.length} total`,
      meta: { added, skipped, totalScanned: driveFiles.length, errors: errors.length > 0 ? errors.slice(0, 10) : undefined },
      ctx: { ...auditContextFromRequest(req), source: 'api' },
    });

    return NextResponse.json({
      success: true,
      added,
      skipped,
      totalScanned: driveFiles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('[gallery/sync] error:', err);
    return NextResponse.json(
      { error: 'Sinkronisasi gagal. Periksa log server untuk detail.' },
      { status: 500 },
    );
  }
}
