# Panduan Arsitektur & Operasional: Cloudflare D1, R2, & Google Sheets

Dokumen ini menjelaskan arsitektur baru **GIA Deliksari Web Portal** setelah migrasi dari Vercel + Supabase ke **Cloudflare Native (OpenNext, D1 Database, R2 Storage)** dengan sinkronisasi **Google Sheets via GitHub Actions**.

---

## 1. Identitas Layanan & Resource Cloudflare

| Komponen | Nama Resource | Tipe | ID / Binding |
|---|---|---|---|
| **Database** | `gia-deliksari-db` | Cloudflare D1 (SQLite Edge) | `0f8a9e42-0a14-4a45-9cbb-55f7d8b2f5f1` (Binding: `DB`) |
| **Media Bucket** | `gia-gallery` | Cloudflare R2 | Binding: `GALLERY_BUCKET` |
| **Worker / Host** | `gia-deliksari-web` | Cloudflare Worker / OpenNext | Portabel Edge Runtime (`nodejs_compat`) |
| **Akun Cloudflare** | `Andreasr35tu@gmail.com` | Account ID | `b3646e9d901e18b382b3f961d2b98f69` |

---

## 2. Kenapa Tidak Ada Lagi Masalah Database Pause?
* Supabase Free Tier sebelumnya otomatis **di-pause** setiap 7 hari jika tidak ada query, menyebabkan web down di akhir pekan jika sepi di hari kerja.
* **Cloudflare D1 tidak pernah di-pause / tidur (24/7 selalu aktif)**, memiliki latensi sub-millisecond karena terintegrasi langsung dalam edge network Cloudflare, dan kapasitas gratis hingga 5 GB (jauh di atas kebutuhan web gereja).

---

## 3. Struktur Database D1 (9 Tabel & 1 View)

1. `announcements`: Warta jemaat, status publikasi (`is_published`), tanggal acara.
2. `servant_rosters`: Roster pelayan ibadah 4 komunitas.
3. `inventory_items`: 18 inventaris alat musik, sound system, multimedia, sakramen.
4. `sermons`: Data khotbah dan video YouTube.
5. `gallery_items`: Metadata galeri dokumentasi terhubung dengan Google Drive.
6. `ministry_requests`: Pengajuan doa, baptisan, komsel, dan volunteer.
7. `users`: Multi-role user login (`roles` disimpan sebagai JSON array string `["super"]`, `["admin"]`, `["treasurer"]`).
8. `youth_treasury_transactions`: Buku kas pemuda Grow Generation.
9. `audit_log`: Catatan riwayat audit keamanan.
10. `youth_treasury_balance` (VIEW): Perhitungan otomatis total pemasukan, pengeluaran, saldo, dan jumlah transaksi.

---

## 4. Cara Menjalankan Perintah D1 CLI

```bash
# Migrasi skema lokal (pengembangan)
npm run d1:migrate:local

# Migrasi skema remote (produksi Cloudflare)
npm run d1:migrate:remote

# Seed data lokal
npm run d1:seed:local

# Seed data remote
npm run d1:seed:remote

# Backup D1 ke file SQL
npm run d1:backup:remote
```

---

## 5. Layering Google Sheets (Papan Transparansi Jemaat)

Agar pengurus gereja (Bapak Gembala, Majelis, Bendahara) yang awam teknologi dapat memantau data tanpa harus membuka SQL atau terminal:

1. Buat Google Spreadsheet baru.
2. Buka menu **Ekstensi -> Apps Script**.
3. Tempel seluruh kode dari `docs/google-apps-script.gs`.
4. Tambahkan Script Property: `WEBHOOK_SECRET` di Apps Script.
5. Deploy sebagai **Web App** (akses: Anyone).
6. Masukkan URL hasil deploy ke GitHub Secrets:
   * `GOOGLE_SHEETS_WEBHOOK_URL`
   * `GOOGLE_SHEETS_WEBHOOK_SECRET`
7. Workflow `.github/workflows/backup-d1-to-sheets.yml` akan berjalan otomatis setiap hari pukul 03:00 WIB (atau manual via tab Actions) untuk mengisi 4 sheet:
   * **Kas Youth** (rekap saldo, warna pemasukan/pengeluaran otomatis)
   * **Warta Jemaat**
   * **Jadwal Pelayanan**
   * **Inventaris**
