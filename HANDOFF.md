# 🤝 HANDOFF BRIEFING — GIA DELIKSARI WEB PORTAL

**Tanggal Update**: 16 Oktober 2026
**Status**: 100% HIJAU · LIVE · 3 LAPISAN BACKUP AKTIF · OBSERVABILITAS AKTIF
**URL Live**: [giadeliksari.my.id](https://giadeliksari.my.id) (fallback: `gia-deliksari-web.zzdree.workers.dev`)
**Git Branch**: `main` (in-sync dengan `origin/main`)

> Sebelum mengubah kode, baca **`RUNBOOK.md`** — itu panduan operasional lengkap.
> Dokumen ini adalah ringkasan status untuk agent penerus.

---

## ⚠️ Aturan yang WAJIB dipatuhi

1. **DILARANG menghidupkan Vercel/Supabase.** 100% Cloudflare native (Workers + D1).
2. **DILARANG mengaktifkan R2.** Keputusan sadar: operator memilih prinsip
   "full free tanpa kartu". R2 butuh metode pembayaran. Galeri pakai Google Drive.
3. **DILARANG warna coklat/krem/sepia.** Palet = **Crimson Field** (hue kanonik
   14.1°, `#8E1533`). Lihat `DESIGN.md` (frontmatter = kontrak mesin `lint:design`).
4. **Glassmorphism hanya untuk Navbar.** Flat di semua tempat lain.
5. **JANGAN percaya HTTP status code untuk verifikasi Apps Script.** Google selalu
   membalas `302` sebelum script jalan. Bukti sah = sheet `Log`.
6. **Setiap ubah kode Apps Script → `Deploy → New deployment`.**
   Kalau kolom Version tetap "Version 1", kode baru **tidak dipakai** (terjadi 3×).

---

## 🛠️ Stack

| | |
|---|---|
| Framework | Next.js 16.3.8 (App Router, Turbopack) |
| Runtime | Cloudflare Workers via `@opennextjs/cloudflare` (`nodejs_compat`) |
| Database | Cloudflare D1 `gia-deliksari-db` (`0f8a9e42-…`) |
| Deploy | `npm run deploy` |
| Test | `npm test` (**35/35**) · `npm run typecheck` (0 error) · `npm run lint:design` (0 anti-pattern) |

---

## ✅ Yang sudah aktif (per 16 Okt 2026)

### 1. Tiga lapisan backup — semuanya terbukti

| Lapisan | Cakupan | Retensi | Verifikasi |
|---|---|---|---|
| **D1 Time Travel** | Seluruh DB, 10 tabel | 23 hari (usia DB) | bookmark aktif |
| **Snapshot git** | 9 tabel, `password_hash` diredaksi | 30 hari | drill restore 143 baris ✅ |
| **Google Sheets** | 9 sheet + Log | selama spreadsheet ada | `SELESAI` di sheet Log ✅ |

- **Script restore ada dan teruji**: `scripts/restore-d1-from-snapshot.mjs`
- **Drill restore pernah dijalankan** ke DB sementara (izin anak gembala diberikan).
  Hasil: semua tabel cocok persis. Lihat `RUNBOOK.md` §1.
- **⚠️ Akun hasil restore MATI** — `password_hash` diisi placeholder inert.
  Harus direset operator setelah restore. Ini perilaku yang benar.

### 2. Observabilitas

- **Workers Logs aktif**, sampling 100%, `persist: true` (dikomit di `wrangler.jsonc`)
- **Health probe** tiap 2 jam (`.github/workflows/health-check.yml`) → buka issue
  berlabel `health-check` kalau gagal, tutup otomatis kalau pulih
- **Notifikasi email kegagalan workflow TERBUKTI** masuk <1 menit

### 3. Keamanan

- **Lockout login di D1** (bukan in-memory — Map per-isolate itu bug, sudah diperbaiki).
  Terbukti live: `401 → 401 → 429 → 429`
- Self role-escalation dicegah; super terakhir tidak bisa dinonaktifkan
- `err.message` tidak lagi bocor ke klien (11 titik diperbaiki)
- Rate limit form publik juga di D1

### 4. CI

```
CI — TypeScript + Playwright smoke   35 unit + 7 smoke
Lighthouse CI                         desktop, hijau
D1 Backup and Google Sheets Sync      harian 03:00 WIB
Health Check — production             tiap 2 jam
```

**Smoke test pakai API, bukan form browser** — 33s (dulu 1.8 menit, sering flake).
Test lockout yang dulu di-`skip` sekarang **aktif dan lulus**.

---

## 📋 Sisa pekerjaan

### Butuh keputusan/keterlibatan manusia
- **Drill restore ulang** secara berkala (prosedur di RUNBOOK §1). Terakhir: 15 Okt.
- **UU PDP**: `ministry_requests` menyimpan nomor WA + isi permohonan doa. Belum ada
  kebijakan retensi / consent / jalur penghapusan. Butuh keputusan pengurus.
- **Data warta** di D1 masih September 2026 (terfilter "lampau"). Pengurus input via `/admin`.

### Menunggu aset dari pengurus
- **QRIS digital belum ada gambarnya.** Halaman `/persembahan` sekarang menyatakan
  jujur bahwa QRIS hanya tersedia **fisik di gedung** (lihat `docs/REKOMENDASI-UIUX.md`).
  Sebelumnya halaman itu menampilkan SVG hiasan 27 kotak yang **tidak bisa dipindai**,
  tapi berlabel "Scan & Bayar" — jemaat yang mencoba pasti gagal tanpa tahu sebabnya.
  Kalau pengurus mengirim gambar QRIS resmi (PNG dari m-banking), tinggal dipasang
  sebagai `<img>`; opsi kedua adalah menambah kolom unggah di `/admin`.

### Teknis (belum dikerjakan siapa pun)
- **Sheet `Sheet1`** di spreadsheet backup — sisa percobaan awal, kosong. Hapus manual.
- 131 advisory `lint:design` non-blocking (font-size di luar ramp). Sebagian besar
  badge uppercase 10px yang masih terbaca; yang prosa sudah dinaikkan ke 12px.
- `docs/PLAN-FLAT-MINIMAL.md` — dokumen perencanaan lama, bisa diarsipkan

### Sudah selesai (16 Okt sore)
- **Unduh jadwal ke kalender HP** — `/api/public/calendar`, tombol di jam tiap kartu
  `/info`. Menangani layanan selang-seling 4 minggu (Youth/Komsel, HANA/Ekklesia)
  dengan predikat minggu siklus, dihitung dalam hari sipil WIB supaya server (UTC)
  dan HP jemaat (WIB) tidak berbeda pendapat. Doa pagi Selasa-Jumat pakai `BYDAY`
  multi-hari. Test: `tests/unit/ics.test.ts`, `tests/unit/calendarRoute.test.ts`,
  `tests/unit/verify-cycle-crosscheck.test.ts`.

  ⚠️ **Jangan kembalikan DTSTART ke format UTC (`...Z`).** `BYDAY` dievaluasi klien
  **di kerangka DTSTART**. Versi pertama menulis instant UTC + hari WIB; untuk 6
  layanan sore itu kebetulan benar (lewat 07.00 WIB → tanggal UTC = WIB), tapi Doa
  Pagi 05.00 WIB = 22.00 UTC **hari sebelumnya**, jadi anchor-nya "Senin" sementara
  aturannya "Selasa". Instance pertama tetap benar (itu anchor-nya), **instance
  berikutnya geser 1 hari — Selasa hilang mulai minggu ke-2**, tanpa petunjuk apa pun
  di halaman. Sekarang `DTSTART;TZID=Asia/Jakarta:<waktu lokal>` + blok `VTIMEZONE`.
  Test yang hanya memeriksa event **pertama** tidak akan pernah menangkap kelas bug
  ini; `verify-cycle-crosscheck.test.ts` memeriksa 56 kombinasi (8 waktu unduh ×
  7 layanan).
- Navigasi "Time-as-Button" di hero dan `/info`; kartu pilar span-2 di `/home`.

---

## 🧠 Pelajaran penting dari sesi 15-16 Okt

Tiga bug terbesar **tidak akan pernah ketemu lewat linter/typecheck/CI**:

1. **Backup menulis 0 baris selama berminggu-minggu.** 17 snapshot "sukses" di git,
   total **0 baris**, sementara D1 punya **123**. Sebab: secret CF tidak ada, script
   hanya `warn` lalu menulis snapshot kosong dan `exit 0`.

2. **Lockout login tidak pernah aktif.** `Map` di Cloudflare Workers = per-isolate,
   jadi hilang tiap request. Kode *terlihat* benar, test dasar lulus, tapi mati di runtime.

3. **Dua bug di Apps Script backup** — keduanya di kode, bukan setelan operator:
   - `writeSheet` kirim matriks tidak persegi (`audit_log` kolom tak seragam,
     `youth_balance` berbentuk objek bukan array)
   - `writeMeta` tulis baris kosong `['']` ke rentang 2 kolom → gagal di **setiap**
     backup yang sebenarnya berhasil

**Akar bersama: sistem gagal tanpa memberi tahu siapa pun.**
Semua perbaikan di sesi ini bermuara pada satu prinsip: **FAIL LOUD, NOT SILENT.**

**Dua alat yang akhirnya memecahkan masalah** (keduanya tidak ada di awal):
- **Penanda versi** (`kode_versi` di doGet) — membuktikan kode mana yang jalan
- **Sheet Log** — menyebut fungsi yang gagal saat HTTP status tidak bisa dipercaya

---

## 🔑 Akses & kredensial

**GitHub secrets** (repo `zzdree/gia-deliksari-web`):
```
CLOUDFLARE_ACCOUNT_ID · CLOUDFLARE_API_TOKEN (D1 Read saja)
GOOGLE_SHEETS_WEBHOOK_URL · GOOGLE_SHEETS_WEBHOOK_SECRET
TEST_SUPER_USER · TEST_SUPER_PASS
NOTIFY_EMAIL
```

**Lokal** (`~/.bashrc`): `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_EMAIL`,
`CLOUDFLARE_API_KEY` (Global API Key — **bekerja**).
`CLOUDFLARE_API_TOKEN` di baris 194 **invalid & dikomentari** — jangan dipakai.

**Global API Key bisa membuat token API** via REST (`POST /user/tokens`) asalkan
`permission_groups` diisi. Daftar ID-nya: `GET /accounts/<id>/tokens/permission_groups`.

**Wrangler**: prefix IPv4-first kalau `fetch failed` (IPv6 mati di mesin dev).
