# 📚 Indeks Dokumentasi — GIA Deliksari Web Portal

Bingung harus baca yang mana? Mulai dari sini.

---

## 🎯 Kalau kamu...

| Situasi | Baca ini |
|---|---|
| **Operator gereja**, mau tahu cara pakai / klik-klik | [`PANDUAN-MANUAL.md`](PANDUAN-MANUAL.md) |
| **Developer/agent baru**, mau lanjut kerja | [`HANDOFF.md`](HANDOFF.md) → [`RUNBOOK.md`](RUNBOOK.md) |
| **Ada masalah teknis**, perlu repair/pemulihan | [`RUNBOOK.md`](RUNBOOK.md) |
| Mau tahu **kenapa** sesuatu diputuskan begitu | [`CHANGELOG.md`](CHANGELOG.md) |
| Mau **setup backup ke Google Sheets** | [`docs/PANDUAN-BACKUP-SHEETS.md`](docs/PANDUAN-BACKUP-SHEETS.md) |
| Mau tahu **isi data gereja** (jadwal, pengurus) | [`INFO.md`](INFO.md) |
| Mau ubah **tampilan/warna** | [`DESIGN.md`](DESIGN.md) (frontmatter = kontrak mesin) |
| Mau tahu **rencana produk** | [`PRD.md`](PRD.md) |

---

## 📖 Dokumen Inti

### [`RUNBOOK.md`](RUNBOOK.md) — ⭐ panduan operasional
Buku manual utama. Isinya:
- **§1 Backup** — 3 lapisan + prosedur pemulihan lengkap
- **§2 R2** — kenapa TIDAK dipakai selamanya
- **§3 Observabilitas** — cara baca log & health check
- **§4 UU PDP** — status data pribadi jemaat
- **§5-8** — gate verifikasi, deployment, migrasi, kredensial

### [`HANDOFF.md`](HANDOFF.md) — briefing penerus
Aturan yang wajib dipatuhi, status terkini, dan **pelajaran penting** dari audit
15-16 Okt 2026 (tiga bug besar yang tidak akan ketemu lewat linter/CI).

### [`PANDUAN-MANUAL.md`](PANDUAN-MANUAL.md) — untuk operator non-teknis
Bahasa sederhana, langkah klik-demi-klik. Tidak ada istilah teknis.

### [`CHANGELOG.md`](CHANGELOG.md) — riwayat versi
Setiap perubahan besar + **alasannya**. Berguna kalau bertanya "kenapa dulu
dibuat begini?".

---

## 🔧 Dokumen Teknis (folder `docs/`)

| File | Isi |
|---|---|
| [`apps-script-backup.gs`](docs/apps-script-backup.gs) | **Kode Apps Script** — 9 sheet + Log. Tempel ke Google Apps Script. |
| [`PANDUAN-BACKUP-SHEETS.md`](docs/PANDUAN-BACKUP-SHEETS.md) | Cara pasang Apps Script (±5 menit) |
| [`CLOUDFLARE-MIGRATION.md`](docs/CLOUDFLARE-MIGRATION.md) | Arsitektur Cloudflare (dari migrasi Vercel/Supabase) |
| [`MUTATION-TESTS-SETUP.md`](docs/MUTATION-TESTS-SETUP.md) | Setup test yang mengubah data |
| [`PLAN-FLAT-MINIMAL.md`](docs/PLAN-FLAT-MINIMAL.md) | Rencana desain lama (arsip) |

---

## 🗂️ Script Operasional (`scripts/`)

| Script | Fungsi | Kapan dipakai |
|---|---|---|
| `backup-d1-to-sheets.mjs` | Snapshot D1 → git + Google Sheets | Otomatis harian 03:00 WIB |
| `restore-d1-from-snapshot.mjs` | Snapshot JSON → SQL restore | **Saat D1 hilang** |

---

## ⚡ Tiga hal yang paling sering ditanya

### 1. "Backup-nya jalan nggak?"
Buka spreadsheet **"GIA Deliksari — Backup Database"** → sheet **`Log`**.
- `SELESAI` = berhasil
- `GAGAL TOTAL` = ada error (kolom Detail menyebut fungsinya)

> **Jangan** cek dari HTTP status — Google Apps Script selalu balas `302`
> sebelum scriptnya jalan. Status code tidak berguna.

### 2. "Kalau D1 rusak, bagaimana?"
Lihat **`RUNBOOK.md` §1**. Ada 3 lapisan, dari yang paling cepat:
1. **Time Travel** (23 hari) — satu perintah, seluruh DB
2. **Snapshot git** — `restore-d1-from-snapshot.mjs`
3. **Google Sheets** — untuk dibaca manusia

### 3. "Kenapa R2 tidak dipakai?"
Karena butuh **kartu kredit** (prinsip operator: full free). Galeri pakai
Google Drive — tetap Rp 0. Lihat **`RUNBOOK.md` §2**.

---

## 📌 Konvensi Dokumen

- **Bahasa**: Indonesia, kecuali kode & istilah teknis
- **Frontmatter YAML** di `DESIGN.md` = **kontrak mesin** untuk `npm run lint:design`
  (prosa di bawahnya hanya dokumentasi)
- **Setiap mengubah kode Apps Script** → wajib `Deploy → New deployment`
- **Setiap fitur baru** → catat di `CHANGELOG.md`
