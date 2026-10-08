import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { execute } from '@/lib/d1';
import { requireRole } from '@/lib/auth';
import { uploadToGoogleDrive } from '@/lib/googleDrive';
import { logAudit, auditContextFromRequest } from '@/lib/auditLog';
import { GalleryItem } from '@/types';

export async function POST(req: NextRequest) {
  const guard = await requireRole(req, ['super', 'admin']);
  if (guard instanceof Response) return guard;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Dokumentasi Jemaat GIA Deliksari';
    const category = (formData.get('category') as string) || 'ibadah';
    const date = (formData.get('date') as string) || new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const uploaderName = (formData.get('uploaderName') as string) || 'Jemaat';

    if (!file) {
      return NextResponse.json({ error: 'File gambar wajib diunggah' }, { status: 400 });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file melebihi batas maksimum 10MB' }, { status: 400 });
    }

    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung. Harap unggah format JPG, PNG, WEBP, atau GIF.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const validExts: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const fileExt = validExts[file.type] || 'jpg';
    const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    let imageUrl = '';
    let thumbUrl = '';
    let driveResult: any = null;

    // 1. Upload ke Google Drive (Master Permanent Archive)
    try {
      driveResult = await uploadToGoogleDrive({
        fileName: `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.${fileExt}`,
        mimeType: file.type || 'image/jpeg',
        buffer,
        description: `Judul: ${title} | Kategori: ${category} | Diunggah oleh: ${uploaderName} | Tanggal: ${date}`,
      });
    } catch (gdriveErr) {
      console.warn('Google Drive direct upload warning:', gdriveErr);
    }

    // 2. Upload ke Cloudflare R2 (jika binding GALLERY_BUCKET tersedia)
    try {
      const ctx = await getCloudflareContext({ async: true });
      if (ctx?.env?.GALLERY_BUCKET) {
        await ctx.env.GALLERY_BUCKET.put(`public/${fileName}`, buffer, {
          httpMetadata: { contentType: file.type || 'image/jpeg' },
        });
        const publicBase = ctx.env.R2_PUBLIC_URL || 'https://gallery.giadeliksari.org';
        imageUrl = `${publicBase}/public/${fileName}`;
        thumbUrl = imageUrl;
      }
    } catch (r2Err) {
      console.warn('Cloudflare R2 upload skipped or unavailable:', r2Err);
    }

    // 3. Fallback: Drive thumbnail atau Base64 data URL
    if (!imageUrl) {
      if (driveResult?.success && driveResult.fileId) {
        imageUrl = `https://drive.google.com/thumbnail?id=${driveResult.fileId}&sz=w2000`;
        thumbUrl = `https://drive.google.com/thumbnail?id=${driveResult.fileId}&sz=w800`;
      } else {
        const base64 = buffer.toString('base64');
        imageUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;
        thumbUrl = imageUrl;
      }
    }

    const id = `gal-${Date.now()}`;
    const now = new Date().toISOString();

    const newGalleryItem: GalleryItem = {
      id,
      title,
      category: category as any,
      image: imageUrl,
      thumbUrl,
      driveFileId: driveResult?.success ? driveResult.fileId : undefined,
      driveWebViewLink: driveResult?.success ? driveResult.webViewLink : undefined,
      uploaderName,
      isPublished: true,
      date,
      createdAt: now,
    };

    // 4. Insert ke Cloudflare D1
    await execute(
      `INSERT INTO gallery_items (
        id, title, category, image, thumb_url, drive_file_id, drive_web_view_link, uploader_name, date, is_published, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        id,
        title,
        category,
        imageUrl,
        thumbUrl || imageUrl,
        newGalleryItem.driveFileId || null,
        newGalleryItem.driveWebViewLink || null,
        uploaderName,
        date,
        now,
      ],
    );

    await logAudit({
      actor: { id: guard.id, username: guard.username, roles: guard.roles },
      action: 'gallery.upload',
      target: { table: 'gallery_items', id, label: title },
      summary: `Admin '${guard.username}' mengunggah foto '${title}' (${category})`,
      meta: { id, title, category, driveFileId: newGalleryItem.driveFileId },
      ctx: auditContextFromRequest(req),
    });

    return NextResponse.json({
      success: true,
      message: 'Foto dokumentasi berhasil diunggah ke Galeri Web & tersimpan abadi di Google Drive',
      item: newGalleryItem,
      googleDrive: driveResult?.success
        ? {
            synced: true,
            fileId: driveResult.fileId,
            link: driveResult.webViewLink,
          }
        : {
            synced: false,
            error: driveResult?.error || 'unconfigured',
          },
      dbSynced: true,
    });
  } catch (error: any) {
    console.error('Gallery upload error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengunggah foto' }, { status: 500 });
  }
}
