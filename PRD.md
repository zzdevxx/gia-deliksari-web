# Product Requirements Document (PRD) — GIA Deliksari Web Portal
**Versi:** 3.4.0 (Multi-Portal & Role-Based Access Edition)
**Status:** Production Ready
**Tanggal Diperbarui:** 31 Agustus 2026
**Identitas Gereja:** Gereja Isa Almasih (GIA) Deliksari Semarang — *"Growing Church!"*

---

## 1. Executive Summary & Vision

GIA Deliksari Web Portal adalah platform pelayanan digital terintegrasi untuk jemaat, majelis, dan tim pastoral Gereja Isa Almasih Deliksari Semarang. Platform ini menggabungkan empat pilar utama:

1. **Public Web Experience** — Landing page (`/home`) + halaman info (`/info`) yang menyajikan jadwal ibadah (4 komunitas: Ibadah Raya, Grow Generation Youth, COC Kidz, Hana), warta jemaat berkategori, transparansi persembahan QRIS, struktur organisasi, galeri dokumentasi, dan formulir permohonan pelayanan.

2. **CMS Portal** — Portal admin (`/admin`) untuk pengurus gereja mengelola warta, roster pelayan, permohonan jemaat, khotbah, dan inventaris.

3. **User Management Portal** — Portal superuser (`/super`) khusus untuk owner/pemilik akun mengelola akun multi-role (admin & treasurer).

4. **Treasury Portal** — Portal kas (`/kas`) untuk bendahara youth Grow Generation mencatat pemasukan & pengeluaran kas.

---

## 2. Information Architecture & Routing

### 2.1 Route Map

| Route | Tipe | Auth | Deskripsi |
|---|---|---|---|
| `/` | server | — | 308 redirect ke `/home` |
| `/home` | static | — | Beranda jemaat: Hero, Hospitality, About & Gembala, 4 Pilar, Lokasi & Kontak |
| `/info` | static | — | Papan warta jemaat mingguan, jadwal roster ibadah, cetak buletin A4, salin format WA |
| `/media` | static | — | Arsip video khotbah YouTube Data API v3 & galeri foto dokumentasi |
| `/layanan` | static | — | Formulir doa, konseling pastoral, pendaftaran sakramen, komsel, volunteer |
| `/persembahan` | static | — | 4 pos persembahan, salin rekening bank BCA & BRI 1-klik, modal QRIS digital |
| `/admin` | client | super / admin | Portal admin/operator (5 tab CRUD) |
| `/super` | client | super only | Portal superuser (user management) |
| `/kas` | client | super / treasurer | Portal kas youth (transaksi + saldo) |
| `/api/auth/login` | POST | — | Login username+password (bcrypt) → cookie session |
| `/api/auth/logout` | DELETE | session | Clear session cookie |
| `/api/auth/check` | GET | session | Return current authenticated user |
| `/api/users` | GET / PATCH | super | List / create / update user |
| `/api/users/[id]` | PATCH / DELETE | super | Update role/password/active |
| `/api/admin/data` | GET / POST / DELETE | super / admin | CRUD tabel admin via Cloudflare D1 |
| `/api/public/data` | GET | — | Read publik sanitized via Cloudflare D1 |
| `/api/public/ministry-requests` | POST | — + rate limit | Submit permohonan jemaat |
| `/api/youth-treasury` | GET / POST | super / treasurer | List + create transaksi kas di D1 |
| `/api/youth-treasury/[id]` | PATCH / DELETE | super / treasurer | Update / delete transaksi di D1 |
| `/api/gallery/upload` | POST | — (multipart) | Upload foto ke Google Drive + D1 |
| `/api/gallery/sync` | POST | session / secret | Sinkronisasi Drive → D1 |
| `/api/youtube/latest` | GET | — | Fetch video khotbah terbaru YouTube Data API v3 |
| `/api/debug/env` | GET | admin (di production) | Diagnostic env vars & D1 binding |

### 2.2 Multi-Portal Authentication

Sistem menggunakan **single sign-on** berbasis cookie `gia_session` (HMAC-SHA256 signed, 12 jam). User dengan role apapun login sekali via `/api/auth/login` dan bisa akses semua portal yang sesuai role-nya:

- **`super`** → akses penuh ke `/super`, `/admin`, `/kas`
- **`admin`** → akses ke `/admin` saja
- **`treasurer`** → akses ke `/kas` saja

API routes memakai helper `requireRole(req, ['super', 'admin'])` dari `src/lib/auth.ts`. Cek role dilakukan server-side di setiap route handler — tidak boleh di-bypass.

---

## 3. Media & Storage Architecture

### 3.1 YouTube Data API v3 Auto-Sync
- **Endpoint**: `/api/youtube/latest`
- Fetch 6 video/livestream terbaru dari channel `UCDh3ojx9ne3HOPoBuuoKlrg` (`@GIADeliksariSemarang`).
- Caching in-memory 2 jam.
- Fallback ke seedData lokal jika API key invalid / quota habis.

### 3.2 Hybrid Rolling Gallery: Google Drive Master + Supabase Storage Cache
- Google Drive = permanent master archive (resolusi asli).
- Supabase Storage `church-gallery` = rolling cache 30–50 foto terkini.
- Auto-prune ketika > 50 foto: hapus dari Supabase, file di Drive tetap aman.
- UI: tombol "Buka Arsip Lengkap di Google Drive".

---

## 4. Spesifikasi Portal Publik (`/home` + `/info`)

### 4.1 `/home` — Landing jemaat
13 section visual: Hero, Hospitality, About, Ministries, Sermons, AnnouncementBoard, Schedule, Organization, MinistryRegistration, Giving, Gallery, LocationContact, Footer.

### 4.2 `/info` — Halaman operasional
2 section terfokus:
- **Papan Warta** — dengan filter kategori (Semua/Ibadah Raya/Grow Youth/COC Kidz/Wanita Hana) + filter waktu (Akan Datang/Semua/Sudah Berlalu) + countdown.
- **Jadwal Pelayanan** — roster ibadah dengan filter kategori komunitas (Semua/Ibadah Raya/Grow Youth/COC Kidz/Wanita Hana).

Data dibaca dari Supabase via `/api/public/data`. Statis (prerendered). Tidak butuh login.

---

## 5. Spesifikasi Portal Admin (`/admin`)

### 5.1 Modul
5 tab utama — dikontrol oleh operator gereja (role: super atau admin):

| Tab | Modul | Tabel Supabase |
|---|---|---|
| 🔔 Warta Jemaat | CRUD warta + pin/unpin + filter publish/draft | `announcements` |
| 👥 Roster Pelayanan | Plotting petugas 4 komunitas + WhatsApp broadcast + cetak A4 | `servant_rosters` |
| 🫶 Layanan Jemaat | Permohonan doa, baptisan, komsel, volunteer | `ministry_requests` |
| 🎬 CMS Khotbah & Galeri | Kelola khotbah + YouTube sync + foto Drive | `sermons`, `gallery_items` |
| 📦 Inventaris & Cek | Checklist sound system, multimedia, musik, ruangan | `inventory_items` |

### 5.2 Flow Pengisian Konten
1. Admin login ke `/admin` dengan username + password.
2. Pilih tab (mis. Warta Jemaat).
3. Klik "Tambah Warta Baru" → form modal → submit.
4. Data terkirim ke `/api/admin/data` (POST).
5. Server validasi session + tulis ke Supabase via service role.
6. UI refresh otomatis dari state lokal.
7. Pengumuman tampil di `/home`, `/info`, dan `/api/public/data`.

---

## 6. Spesifikasi Portal Superuser (`/super`)

### 6.1 Fitur
- **List users**: username, role, display_name, status aktif, login terakhir.
- **Create user**: username (3-64 char, unique), password (≥4 char, bcrypt-hashed), role (super/admin/treasurer), display_name.
- **Edit user**: ubah role, password, display_name, aktif/nonaktif.
- **Soft-delete**: set active=false (audit trail preserved).

### 6.2 Akses
- Hanya role `super` yang bisa akses `/super`.
- Default superuser: `andreas` / `5050` (seeded via `scripts/seed-users.mjs`).
- Endpoint `/api/users` & `/api/users/[id]` dilindungi `requireRole(['super'])`.

---

## 7. Spesifikasi Portal Kas (`/kas`)

### 7.1 Fitur
- **3 Saldo Cards**: Total Pemasukan, Total Pengeluaran, Saldo (colored by sign).
- **Buku Kas**: list transaksi dengan filter tipe (income/expense) + search box.
- **Add transaksi**: modal form (tanggal, tipe, kategori, nominal, catatan). Kategori saran: `iuran_anggota`, `sumbangan`, `konsumsi`, `transportasi`, `alat`, `acara`, `lainnya`.
- **Validasi**: amount > 0, ≤ Rp 1 milyar, transaction_date valid.
- **Aggregate balance**: dari SQL view `youth_treasury_balance` (single source of truth).

### 7.2 Skema
Tabel: `youth_treasury_transactions` (id, transaction_date, type, category, amount, description, created_by → users, created_at, updated_at).
View: `youth_treasury_balance` (total_income, total_expense, balance, income_count, expense_count).

---

## 8. Hybrid Storage Architecture: Drive Gudang + Supabase Etalase CDN

### 8.1 Prinsip
- Google Drive = permanent master archive (full resolution, abadi).
- Supabase = etalase metadata + thumbnail CDN (Image Transform, 800px WebP).
- Jemaat boleh upload + download, TIDAK boleh hapus/edit — token Drive hanya di server.
- TIDAK ADA endpoint DELETE/EDIT di layer jemaat.

### 8.2 Security Model
1. Jemaat tidak pegang kredensial Drive.
2. API route `/api/gallery/upload` hanya terima multipart/form-data untuk create file baru.
3. Folder Drive permission: `reader` untuk anyone-with-link.
4. jemaat bisa download via Drive webViewLink, tapi tidak bisa list/delete.

---

## 9. Setup Manual Pertama Kali

### 9.1 Database
1. Jalankan migration via Supabase CLI:
   ```bash
   supabase db push --include-all
   ```
   Ini apply semua migration di `supabase/migrations/`.

2. Seed users default:
   ```bash
   node scripts/seed-users.mjs
   ```
   Ini insert akun default:
   - `andreas` / `5050` (super)
   - `noel` / `1515` (admin)
   - `mara` / `1234` (treasurer)

### 9.2 Environment Variables (Vercel Production)
Set di Vercel dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, bypass RLS)
- `ADMIN_SESSION_SECRET` (random 32-char string)

### 9.3 Sync Data Placeholder
Setelah deploy pertama:
```bash
node scripts/sync-placeholder.mjs
```
Ini wipe production announcements + roster ke state placeholder, supaya landing publik tidak menampilkan data lama (fake). Admin selanjutnya input data real via `/admin`.

---

## 10. Environment Variables Lengkap

```env
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-jwt>
SUPABASE_SERVICE_ROLE_KEY=<service-role-jwt>
SUPABASE_ACCESS_TOKEN=<management-api-token>

# === Admin / Auth ===
NEXT_PUBLIC_ADMIN_PASSWORD=1515                # legacy fallback (informational only)
ADMIN_SESSION_SECRET=<random-32-char>            # HMAC key untuk gia_session cookie

# === Google Drive (OAuth) ===
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
GOOGLE_DRIVE_UPLOAD_FOLDER_ID=
GOOGLE_DRIVE_PUBLIC_FOLDER_ID=

# === YouTube Data API v3 ===
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
```

---

## 11. Prinsip Pemeliharaan

1. **INFO.md adalah single source of truth** untuk semua informasi non-konten gereja (identitas, kontak, struktur, jadwal ibadah, persembahan). Selalu update INFO.md dulu sebelum ubah code.
2. **Warta & roster pelayanan** tidak disimpan di code — sepenuhnya dikontrol oleh admin via `/admin`. Code hanya berisi placeholder 1 sample.
3. **Password** disimpan sebagai bcrypt hash di Supabase. Tidak pernah plain text di code/env/log.
4. **RBAC**: gunakan `requireRole(req, [...])` di setiap API route baru. Test matrix role sebelum merge.
5. **CSP header** sudah aktif (`next.config.ts`). Tambahkan host baru ke directive yang relevan saat menambah integrasi.
6. **Schema migrations** diletakkan di `supabase/migrations/` dengan format timestamp `YYYYMMDDHHMMSS_nama.sql`. Apply via `supabase db push`.
7. **Backup workflow** (`.github/workflows/daily-backup.yml`) auto-backup harian ke Google Drive.

---

_Phase 1 (CMS): selesai_
_Phase 2 (Multi-role auth + super portal): selesai_
_Phase 3 (/admin pakai multi-user auth): selesai_
_Phase 4 (/kas + treasury): selesai_
_Phase 5 (/info page): selesai_
_Phase 6 (Cleanup placeholder & Zoom link): selesai_
_Phase 7 (PRD/DESIGN.md sync dengan multi-portal): selesai_

_Dokumen ini terakhir diperbarui: **31 Agustus 2026**._