<div align="center">

  <img src="public/images/logo.png" alt="GIA Deliksari Logo" width="120" height="120" style="border-radius: 50%; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);" />

  # GIA DELIKSARI SEMARANG
  ### Portal Publik Jemaat & Sistem Informasi Operasional Gereja
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![License: Private](https://img.shields.io/badge/License-Proprietary_Private-red?style=for-the-badge)](LICENSE)

  <p align="center">
    <strong>Gereja Isa Almasih Deliksari</strong> — <em>"A Growing Church in Faith, Love, and Hope"</em><br />
    Jl. Kolonel Hadijanto, Deliksari, Gunung Pati, Kota Semarang, Jawa Tengah 50229
  </p>

</div>

---

## 🌐 Halaman & Akses Aplikasi (Live Deployment)

Website telah resmi aktif dan ter-deploy secara langsung di **Vercel Production**:
**[gia-deliksari-web.vercel.app](https://gia-deliksari-web.vercel.app)**

| Portal | Path | Akses | Deskripsi singkat |
|---|---|---|---|
| 🕊️ **Beranda Jemaat** | [`/home`](/home) | publik | Landing page: profil gereja, warta, jadwal, galeri, kontak, persembahan. |
| 📋 **Info Pelayanan** | [`/info`](/info) | publik | Papan warta + jadwal pelayanan fokus operasional. |
| 🛡️ **Admin / Operator** | [`/admin`](/admin) | `super` / `admin` | 5 tab: Warta, Roster, Layanan Jemaat, Khotbah & Galeri, Inventaris. |
| 👑 **Superuser** | [`/super`](/super) | `super` only | User management (create, edit roles, soft-delete). |
| 💰 **Kas Youth** | [`/kas`](/kas) | `super` / `treasurer` | Catat pemasukan/pengeluaran kas Grow Generation + saldo realtime. |

Akun production saat ini (lihat INFO.md §10.2 untuk detail):
- `andreas` / `5050` → `super` (akses semua portal)
- `zzdree` / `9090` → `admin` + `treasurer` (akses `/admin` & `/kas`)

---

## 📖 Ringkasan Proyek

**GIA Deliksari Web** adalah platform digital komprehensif yang dibangun khusus untuk melayani jemaat **Gereja Isa Almasih (GIA) Deliksari Semarang**. Platform ini menggabungkan landing page publik yang modern, responsif, dan interaktif dengan portal manajemen operasional gereja yang terintegrasi langsung ke cloud database **Supabase**.

### 🌟 Fitur Utama

### 1. Public Landing Page (`/public` & `/`)
- **Hero & Church Identity**: Banner foto riil gedung gereja, tagar *"GROWING CHURCH! 🔥"*, serta akses cepat ke warta dan jadwal.
- **Tentang & Gembala Sidang**: Profil pelayanan **Ps. Yohanes Sutono** beserta visi, misi, dan nilai-nilai inti jemaat.
- **4 Pilar Pelayanan Ibadah**:
  1. ⛪ **Ibadah Raya Umum** (Minggu 07:00 & 16:30 WIB)
  2. 🔥 **Grow Generation Youth / PRBK** (Sabtu 17:00 WIB)
  3. 🎨 **COC Kidz / Sekolah Minggu** (Minggu 07:00 WIB)
  4. 🌸 **Persekutuan Kaum Wanita Hana** (Kamis 16:00 WIB)
- **Papan Warta & Pengumuman Interaktif**: Menampilkan pengumuman minggu depan/bulan ini yang terfilter langsung dari database.
- **Galeri Dokumentasi Foto Asli**: 8+ foto resolusi tinggi terverifikasi dari Google Maps dan YouTube dengan filter kategori dan tampilan *interactive lightbox modal*.
- **Lokasi & Google Maps**: Integrasi lokasi resmi, panduan rute navigasi, dan tautan deep link WhatsApp doa/konseling.
- **Dark Mode & Light Mode**: Dukungan pergantian tema dinamis (*persisted*).

### 2. Admin Operational Portal (`/admin`)
- 🔒 **Security Gate**: Terproteksi password session-based (`1515`).
- 📢 **Manajemen Warta & Pengumuman**: Tambah, edit, hapus, pin warta prioritas, dan filter status publikasi.
- 👥 **Plotting Jadwal Pelayan Ibadah**: Tab khusus untuk 4 kategori (General, Youth, Kidz, Hana) dengan input peran (WL, Singer, Pemusik, Multimedia, Usher, dll), nomor telepon, dan status konfirmasi.
- 📦 **Checklist & Audit Inventaris**: Daftar inventaris alat gereja (Sound System, Multimedia, Musik, Kursi & Gedung) dengan fitur centang/uncentang realtime, filter status kondisi (*Good / Maintenance / Broken*), dan reset checklist sebelum ibadah.
- 🔄 **Supabase Dual-Sync Engine**: Otomatis menyimpan data ke cloud database Supabase PostgreSQL sekaligus caching lokal di `localStorage` saat offline.

---

## 🛠️ Tech Stack & Arsitektur

```mermaid
graph TD
    Client[Browser Desktop / Mobile] --> NextApp[Next.js 16.3.3 App Router]
    NextApp --> PublicHome["Public (/home, /info)"]
    NextApp --> AdminPortal["/admin (super | admin)"]
    NextApp --> SuperPortal["/super (super only)"]
    NextApp --> KasPortal["/kas (super | treasurer)"]
    PublicHome --> APIs[/api/public/*]
    AdminPortal --> APIs
    SuperPortal --> APIs
    KasPortal --> APIs
    APIs --> AuthLib["src/lib/auth.ts (multi-role + bcrypt + rate-limit)"]
    AuthLib --> SupabaseAdmin[(Supabase PostgreSQL + service_role)]
    AdminPortal --> Drive[Google Drive + Service Account]
    PublicHome --> YouTube[YouTube Data API v3]
    Drive --> Cache[Supabase Storage rolling 30–50 foto]
```

- **Framework**: Next.js 16.3.3 (App Router, Server Components & Static Site Generation)
- **UI & Styling**: React 19, Tailwind CSS 3 (Custom Sacred Crimson & Warm Cream palette, Dark/Light mode)
- **Database**: Supabase PostgreSQL 17 + 7 timestamped migrations + RLS lockdown
- **Auth**: bcrypt (cost 10) + HMAC-SHA256 session cookie + in-memory rate limit
- **Storage**: Google Drive master + Supabase rolling cache (30–50 foto) via Service Account OAuth
- **Integrations**: YouTube Data API v3 (khotbah auto-sync)
- **Icons & Assets**: Lucide React Icons & Custom Church Brand SVG Icons
- **Optimization**: `next/image` modern AVIF/WebP image pipeline, edge caching via Vercel CDN

---

## 📁 Struktur Direktori

```text
gia-deliksari-web/
├── public/
│   └── images/                 # Aset foto asli resolusi tinggi & logo gereja
│       ├── logo.png            # Logo resmi GIA Deliksari
│       ├── hero-church.jpg     # Foto tampak depan gedung fisik gereja
│       ├── pastor-yohanes.jpg  # Ps. Yohanes Sutono di mimbar
│       ├── ministry-*.jpg      # Foto dokumentasi 4 pilar pelayanan
│       └── gallery-*.jpg       # Galeri foto kegiatan & persekutuan
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout & tema
│   │   ├── page.tsx            # Redirect '/' → '/home'
│   │   ├── home/page.tsx       # Landing publik jemaat (8+ section)
│   │   ├── info/page.tsx       # Halaman fokus warta + jadwal pelayanan
│   │   ├── admin/page.tsx      # Portal admin (5 tab CRUD)
│   │   ├── super/page.tsx      # Portal superuser (user management)
│   │   ├── kas/page.tsx        # Portal kas youth (treasury)
│   │   ├── manifest.ts         # PWA manifest
│   │   ├── robots.ts           # SEO robots
│   │   ├── sitemap.ts          # SEO sitemap
│   │   └── api/
│   │       ├── auth/           # login / logout / check (multi-role + bcrypt)
│   │       ├── users/          # CRUD user (super only)
│   │       ├── admin/data/     # CRUD warta/roster/inventaris/khotbah/galeri
│   │       ├── public/data/    # Read publik sanitasi
│   │       ├── public/ministry-requests/  # Submit permohonan jemaat
│   │       ├── gallery/        # upload + sync ke Google Drive
│   │       ├── youtube/latest/ # Fetch khotbah terbaru YouTube Data API v3
│   │       ├── youth-treasury/ # CRUD transaksi kas
│   │       └── debug/env/      # Diagnostic env vars (admin-only)
│   ├── components/             # Section publik + admin hooks
│   │   ├── Hero.tsx, Navbar.tsx, Footer.tsx, ThemeToggle.tsx, …
│   │   └── admin/              # useAdminAuth, useAdminData, useToast
│   ├── lib/
│   │   ├── auth.ts             # 🆕 Multi-role auth + bcrypt + rate limit
│   │   ├── admin-session.legacy.ts  # ⚠️ Deprecated, kept for legacy routes
│   │   ├── supabase.ts         # Anon client (client + server)
│   │   ├── supabaseAdmin.ts    # Service-role client (server-only, RLS bypass)
│   │   ├── googleDrive.ts      # Drive OAuth + folder router
│   │   ├── scheduleUtils.ts    # 4-week rotating schedule helpers
│   │   └── seedData.ts         # 1-row placeholder per table (DB is SoT)
│   └── types/index.ts          # TypeScript interfaces
├── supabase/
│   ├── schema.sql              # Legacy baseline schema
│   └── migrations/             # 7 timestamped migrations (chronological)
│       ├── 001_gallery_drive_integration.sql
│       ├── 20260823_cms_and_ministry_tables.sql
│       ├── 20260825_lock_down_rls.sql
│       ├── 20260828_add_is_published_and_normalize.sql
│       ├── 20260830120000_create_users_table.sql
│       ├── 20260830130000_create_youth_treasury.sql
│       └── 20260831100000_multi_role_users.sql
├── scripts/                    # Ops tooling (seed, backup, drive diagnostic)
├── .github/workflows/
│   └── daily-backup.yml        # GH Actions daily Supabase → JSON → repo
├── backups/                    # Auto-generated daily JSON snapshots (30-day retention)
├── INFO.md                     # Single source of truth (identitas, jadwal, struktur)
├── PRD.md                      # Product Requirements Document
├── DESIGN.md                   # Design System & Token Specification v3.4.0
├── LICENSE                     # Proprietary & Private
└── package.json
```

---

## 🗄️ Skema Database Supabase

Proyek ini menggunakan 9 tabel + 1 view di Supabase PostgreSQL (lihat `supabase/migrations/`):

| Tabel / View | Fungsi |
|---|---|
| `announcements` | Warta jemaat + tanggal acara + pin + status publikasi. |
| `servant_rosters` | Plotting pelayan ibadah 4 komunitas + peran + WhatsApp. |
| `inventory_items` | Inventaris alat gereja + checklist + kondisi. |
| `sermons` | Khotbah + YouTube sync metadata. |
| `gallery_items` | Foto galeri hybrid (Drive + Supabase rolling cache). |
| `ministry_requests` | Permohonan jemaat (doa, baptisan, komsel, volunteer). |
| `users` | Multi-role auth (super / admin / treasurer) + bcrypt hash. |
| `youth_treasury_transactions` | Buku kas Grow Generation (income/expense). |
| `youth_treasury_balance` (view) | Agregat saldo realtime (income, expense, balance, counts). |

RLS lockdown: hanya published rows yang bisa di-SELECT publik, mutation hanya lewat service-role dari API routes yang sudah melewati `requireRole()`.

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### 1. Clone Repository & Masuk Direktori
```bash
git clone https://github.com/zzdree/gia-deliksari-web.git
cd gia-deliksari-web
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di root proyek (lihat `.env.example` untuk dokumentasi lengkap):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-jwt>
SUPABASE_ACCESS_TOKEN=<management-api-token>

# Admin / Auth
ADMIN_SESSION_SECRET=<random-32-char-string>

# Google Drive (OAuth)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
GOOGLE_DRIVE_UPLOAD_FOLDER_ID=
GOOGLE_DRIVE_PUBLIC_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

# YouTube Data API v3
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
```

### 4. Setup Database (sekali saja per environment)
```bash
# Link ke Supabase project kamu
supabase link --project-ref <your-project-ref>

# Apply semua migration
supabase db push

# Seed akun default (andreas / 5050)
node scripts/seed-users.mjs
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000) — otomatis redirect ke `/home`.

### 6. Build untuk Produksi
```bash
npm run build
npm run start
```

---

## 📱 Media Sosial & Kontak Resmi Gereja

- 📷 **Instagram**: [@giadeliksari](https://www.instagram.com/giadeliksari/)
- 🔥 **Youth Instagram**: [@growgeneration_](https://www.instagram.com/growgeneration_/)
- 🎈 **Kids Instagram**: [@cockidz](https://www.instagram.com/cockidz/)
- 🎥 **YouTube Channel**: [@GIADeliksariSemarang](https://www.youtube.com/@GIADeliksariSemarang)
- 📍 **Google Maps**: [Gereja Isa Almasih Deliksari Semarang](https://share.google/O7HqL1J615kgxt66v)

---

## 🔒 Lisensi

Kode sumber dan seluruh aset dalam proyek ini bersifat **Proprietary & Private (All Rights Reserved)**. Hak Cipta dilindungi undang-undang atas nama **Gereja Isa Almasih Deliksari Semarang**. Detail ketentuan tertera pada file [LICENSE](LICENSE).
