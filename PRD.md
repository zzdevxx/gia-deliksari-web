# Product Requirements Document (PRD) — GIA Deliksari Web Portal
**Versi:** 4.1.0 (Cloudflare Native, Custom Domain & Impeccable Design System Edition)
**Status:** Production Live (https://giadeliksari.my.id)
**Tanggal Diperbarui:** 7 Oktober 2026
**Identitas Gereja:** Gereja Isa Almasih (GIA) Deliksari Semarang — *"Growing Church!"*

---

## 1. Executive Summary & Vision

GIA Deliksari Web Portal adalah platform pelayanan digital terintegrasi untuk jemaat, majelis, dan tim pastoral Gereja Isa Almasih Deliksari Semarang. Platform ini menggabungkan empat pilar utama:

1. **Public Web Experience** — Landing page (`/home`) + halaman info (`/info`) yang menyajikan jadwal ibadah (4 komunitas: Ibadah Raya, Grow Generation Youth, COC Kidz, Hana), warta jemaat berkategori, transparansi persembahan QRIS, struktur organisasi, galeri dokumentasi, dan formulir permohonan pelayanan.

2. **CMS Portal** — Portal admin (`/admin`) untuk pengurus gereja mengelola warta, roster pelayan, permohonan jemaat, khotbah, dan inventaris.

3. **User Management Portal** — Portal superuser (`/super`) khusus untuk owner/pemilik akun mengelola akun multi-role (admin & treasurer).

4. **Treasury Portal** — Portal kas (`/kas`) untuk bendahara youth Grow Generation mencatat pemasukan & pengeluaran kas.

**Design System (sejak 7 Okt 2026, v4.1.0)** — Seluruh permukaan mengikuti sistem visual **Warm Alabaster & Sacred Wine** yang dijelaskan di `DESIGN.md` (token normatif) dan digrounding di `PRODUCT.md` (Impeccable). Aturan inti: kanvas netral hangat (light `#FAF7F2` / dark `#141312`), aksen Sacred Wine `#8B1E28` maksimal 10% hanya untuk CTA primer & nav aktif, semantik rose = bahaya/pengeluaran dan emerald = pemasukan, kategori komunitas memakai tone wine/terracotta/gold/plum yang diredam. Verifikasi wajib sebelum rilis: `npm run lint:design` (Impeccable, target 0 anti-pattern), `npm test`, `npm run typecheck`.

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

### 3.2 Media & Gallery Archive
- Google Drive = permanent master archive (resolusi asli).
- Cloudflare D1 `gallery_items` = database metadata & link streaming media.
- UI: tombol "Buka Arsip Lengkap di Google Drive" & empty state template elegan siap foto riil.

---

## 4. Spesifikasi Portal Publik (`/home`, `/info`, `/media`, `/layanan`, `/persembahan`)

### 4.1 `/home` — Beranda Jemaat
6 section visual fokus (anti-slop, ringkas & hangat):
1. **Hero**: Visual branding logo resmi GIA Deliksari, status ibadah, alamat Sekaran UNNES.
2. **Hospitality**: Panduan jemaat baru & link WhatsApp pastoral resmi (`+62 896-2096-1103`).
3. **About & Gembala**: Visi penggembalaan "Growing Church!" & kartu tim penggembalaan (monogram/initials resmi & link medsos).
4. **4 Pilar Komunitas**: Ibadah Raya, Grow Generation Youth, COC Kidz, Wanita HANA.
5. **Struktur Organisasi**: Bagan kepengurusan pelayanan (§4 di `INFO.md`): Youth, 5 Komsel Sel, Sekolah Minggu, Wanita HANA.
6. **Lokasi & Kontak**: Peta Google Maps, alamat resmi, kontak, dan FAQ.

### 4.2 `/info` — Warta & Jadwal Operasional
3 section terfokus:
- **Papan Warta** (`#warta`) — filter kategori + filter waktu + countdown + tombol "Salin Format WA Warta".
- **Jadwal & Agenda Ibadah Rutin** (`#agenda`) — 4 pilar ibadah, Doa Pagi + tombol langsung Join Zoom, Latihan Musik, Jam Kantor Gereja.
- **Jadwal Pelayan Ibadah** (`#roster`) — roster ibadah dengan toggle List / Kalender interaktif + tombol "Salin Format WA Roster".
- **Cetak Buletin A4** (`/info/print`) — rute mandiri siap cetak A4 portrait standar Sinode GIA Deliksari.

Data dibaca dari Cloudflare D1 via `/api/public/data`. Tidak butuh login.

---

## 5. Spesifikasi Portal Admin (`/admin`)

### 5.1 Modul
5 tab utama — dikontrol oleh operator gereja (role: super atau admin):

| Tab | Modul | Tabel D1 |
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
4. Data terkirim ke `/api/admin/data` (POST) dengan validasi whitelist kolom skema.
5. Server validasi session + tulis ke Cloudflare D1 via prepared statements.
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
- Akun superuser awal di-seed ke D1 via `migrations/0002_initial_seed.sql`; kredensial ada di vault pengurus, tidak di dokumen ini.
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

## 8. Hybrid Storage Architecture: Drive Gudang + Cloudflare D1 & Edge Delivery

### 8.1 Prinsip
- Google Drive = permanent master archive (full resolution, abadi).
- Cloudflare D1 = cache metadata + thumbnail URL untuk rendering cepat di web.
- Operator upload via `/admin` (terautentikasi), visitor hanya membaca.
- TIDAK ADA endpoint DELETE/EDIT di layer jemaat publik.

### 8.2 Security Model
1. Jemaat tidak pegang kredensial Drive.
2. API route `/api/gallery/upload` dilindungi `requireRole(['super', 'admin'])`.
3. Folder Drive permission: `reader` untuk anyone-with-link.
4. Jemaat bisa melihat via thumbnail dan webViewLink, tapi tidak bisa list/delete langsung.

---

## 9. Setup Database & Deployment

### 9.1 Database Cloudflare D1
1. Jalankan migration via npm scripts / Wrangler:
   ```bash
   npm run d1:migrate:remote
   ```
   Ini mengaplikasikan schema di `migrations/0001_initial_schema.sql`.

2. Seed data awal (users, announcements, roster, inventaris):
   ```bash
   npm run d1:seed:remote
   ```
   Ini memasukkan data awal dari `migrations/0002_initial_seed.sql`.

### 9.2 Secrets Management (Cloudflare Workers)
Set via `npx wrangler secret put <NAME>`:
- `ADMIN_SESSION_SECRET` (random 32+ char HMAC secret)
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `YOUTUBE_API_KEY`

Public non-sensitive variables disimpan di blok `vars` pada `wrangler.jsonc`.

---

## 10. Environment Variables Lengkap

```env
# === Admin / Auth ===
ADMIN_SESSION_SECRET=<random-32-char>            # HMAC key untuk gia_session cookie (wajib)

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
3. **Password** disimpan sebagai bcrypt hash di Cloudflare D1. Tidak pernah plain text di code/env/log.
4. **RBAC**: gunakan `requireRole(req, [...])` di setiap API route baru. Test matrix role sebelum merge.
5. **CSP header** sudah aktif (`next.config.ts`). Tambahkan host baru ke directive yang relevan saat menambah integrasi.
6. **Schema migrations** diletakkan di `migrations/` dengan format SQL (`0001_initial_schema.sql`, dst). Apply via `npm run d1:migrate:remote`.
7. **Backup workflow** (`.github/workflows/backup-d1-to-sheets.yml`) auto-backup harian D1 ke Google Sheets pengurus.

---

_Phase 1 (CMS): selesai_
_Phase 2 (Multi-role auth + super portal): selesai_
_Phase 3 (/admin pakai multi-user auth): selesai_
_Phase 4 (/kas + treasury): selesai_
_Phase 5 (/info page): selesai_
_Phase 6 (Cleanup placeholder & Zoom link): selesai_
_Phase 7 (Migrasi Cloudflare D1 & OpenNext): selesai_

_Dokumen ini terakhir diperbarui: **8 Oktober 2026**._