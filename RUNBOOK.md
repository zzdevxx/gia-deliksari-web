# RUNBOOK — GIA Deliksari Web Portal

Operasi harian, pemulihan, dan hal-hal yang **hanya bisa dilakukan operator**
(bukan di otomatiskan dari repo). Ditulis 15 Okt 2026 setelah audit menemukan
backup D1 yang bertahun-tahun menulis snapshot kosong.

---

## 1. 🔴 Backups — status & pemulihan

### Kondisi saat audit (15 Okt 2026)

Git history berisi **17 snapshot, total 0 baris**. Setiap file `backups/d1/*.json`
punya `"counts"` semua nol dan `"tables"` semua `[]`, tetapi workflow melaporkan
**sukses** setiap malam.

**Sebab:** repo tidak punya secret `CLOUDFLARE_API_TOKEN` maupun
`CLOUDFLARE_ACCOUNT_ID`. Script lama hanya `console.warn` saat token absen, lalu
menulis snapshot kosong dan `exit 0`. Workflow meng-commit-nya.

**Dampak:** jika D1 hilang, **tidak ada** yang bisa dipulihkan.

### Perbaikan yang sudah dipasang

| Lapis | Perilaku |
|---|---|
| Script, kredensial absen | `exit 1` — tidak menulis apa pun |
| Script, snapshot 0 baris | `exit 1` — menolak menulis "backup" palsu |
| Workflow, step verifikasi | Snapshot 0 baris → job GAGAL → step commit tidak jalan |
| Fallback account-id | Dihapus (default truthy yang salah = membaca tenant keliru) |

### ✅ Snapshot nyata pertama

`backups/d1/20261015165216.json` — **131 baris**:

```
announcements 4 · servant_rosters 7 · inventory_items 7 · sermons 3
ministry_requests 3 · users 4 · audit_log 103 · treasury 0 · gallery 0
```

`password_hash` **tidak** diekspor (memang diredaksi oleh script).

### ⚠️ Yang masih harus kamu lakukan

**a. Buat Cloudflare API Token** (sekali saja):

1. Buka <https://dash.cloudflare.com/profile/api-tokens>
2. **Create Token** → template **"Read all resources"** atau **Custom token**
3. Permissions: `Account` → `D1` → **Read**
4. Account Resources: `Andreasr35tu@gmail.com's Account`
5. Copy token-nya (hanya tampil sekali)

> Global API Key **tidak bisa** dipakai sebagai Bearer token, jadi harus dibuat
> token baru. Token yang lama di `~/.bashrc` sudah invalid (dikomentari).

**b. Pasang sebagai repo secret:**

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID --repo zzdree/gia-deliksari-web
gh secret set CLOUDFLARE_API_TOKEN --repo zzdree/gia-deliksari-web
```

**c. Uji manual:**

```bash
gh workflow run "D1 Backup and Google Sheets Sync" --repo zzdree/gia-deliksari-web
gh run watch $(gh run list --workflow="D1 Backup and Google Sheets Sync" --limit 1 --json databaseId --jq '.[0].databaseId')
```

Harus **sukses** dan menghasilkan snapshot dengan total baris **> 0**.

**d. Bersihkan snapshot kosong** dari `backups/d1/` (17 file), supaya history
tidak lagi menyimpan bukti backup yang tidak pernah menyalin apa pun:

```bash
git rm backups/d1/20260929000440.json backups/d1/20260929231735.json \
       backups/d1/20260930232129.json backups/d1/20261001233528.json \
       backups/d1/20261002232726.json backups/d1/20261003223351.json \
       backups/d1/20261004223752.json backups/d1/20261006010321.json \
       backups/d1/202606232822.json   2>/dev/null || true
# (sisakan snapshot nyata 20261015165216.json)
git commit -m "chore(backup): drop empty snapshots that captured no data"
git push
```

### 🔁 Prosedur pemulihan (belum pernah diuji!)

**Jalankan ini setidaknya sekali** sebelum kamu benar-benar membutuhkannya.
Backup yang belum pernah dipulihkan bukan backup.

```bash
# 1. Buat D1 sementara, restore ke sana — JANGAN ke produksi
npx wrangler d1 create gia-restore-drill

# 2. Terapkan schema
npx wrangler d1 execute gia-restore-drill --remote \
  --file=./migrations/0001_initial_schema.sql
npx wrangler d1 execute gia-restore-drill --remote \
  --file=./migrations/0003_add_announcement_end_date.sql

# 3. Muat snapshot nyata (butuh konversi JSON→SQL; lihat scripts/)
#    Bandingkan jumlah baris dengan sumber.

# 4. Setelah cocok, hapus
npx wrangler d1 delete gia-restore-drill
```

---

## 2. 🟠 R2 (penyimpanan galeri) — belum aktif

`npx wrangler r2 bucket list` → **error 10042**: R2 belum diaktifkan di akun.
Cloudflare minta persetujuan ToS sekali lewat dashboard.

Akibatnya `ctx.env.GALLERY_BUCKET` selalu `undefined`, dan unggah/sinkron galeri
selalu jatuh ke URL thumbnail Google Drive.

**Untuk mengaktifkan:**

1. <https://dash.cloudflare.com/> → **R2** → aktifkan (setuju ToS)
2. `npx wrangler r2 bucket create gia-deliksari-gallery`
3. Buka komentar blok `r2_buckets` di `wrangler.jsonc` (sudah disiapkan)
4. `npm run deploy`
5. Arahkan `gallery.giadeliksari.org` → R2 custom domain
   > Hostname ini **tidak resolve** hari ini (dicek 15 Okt 2026). Selama itu,
   > biarkan `R2_PUBLIC_URL` kosong/konsisten — kalau R2 aktif tapi hostname
   > belum, gambar akan tampil sebagai URL rusak.

Catatan: `gallery_items` **0 baris**, jadi tidak ada galeri yang rusak saat ini.
Ini pekerjaan pencegahan, bukan perbaikan darurat.

---

## 3. 🟠 Observabilitas — nol saat ini

Tidak ada error tracking, tidak ada uptime monitor. Kegagalan seperti backup
kosong di atas terjadi **tanpa ada yang tahu** selama berminggu-minggu. Itu
alasan utama observabilitas masuk daftar ini.

**Opsi termurah (gratis, native Cloudflare):**

```
Cloudflare Dashboard → Workers & Pages → gia-deliksari-web → Logs
  → Enable Workers Logs (observability)
```

Lalu tambahkan **Tail Worker** untuk menangkap exception runtime ke tempat yang
bisa dilihat. Alternatif: pasang **UptimeRobot** (gratis) untuk ping
`https://giadeliksari.my.id/home` tiap 5 menit dan kirim email kalau turun.

**Minimum yang sebaiknya ada:** satu alert ke email kalau
`backup-d1-to-sheets` gagal. GitHub Actions bisa kirim notifikasi kegagalan
workflow ke email otomatis (`Settings → Notifications`).

---

## 4. Data pribadi (UU PDP)

`ministry_requests` menyimpan nama, nomor WhatsApp, dan isi permohonan doa /
konseling. `servant_rosters` menyimpan nomor kontak pelayan.

Repo **PRIVATE**, jadi tidak ada eksposur publik. Yang belum ada:

- **Kebijakan retensi** — tidak ada yang menghapus permohonan lama
- **Consent** — formulir `/layanan` tidak menyatakan bagaimana data disimpan
- **Jalur penghapusan** — tidak ada cara jemaat minta datanya dihapus

Minimal: tambahkan satu baris di `/layanan` yang menjelaskan data dipakai hanya
untuk pelayanan pastoral dan berapa lama disimpan. Ini keputusan pengurus gereja,
bukan keputusan teknis.

---

## 5. Gate verifikasi (jalankan sebelum rilis)

```bash
npm run typecheck     # 0 error
npm test              # 35/35
npm run lint:design   # 0 pelanggaran
npm audit --omit=dev  # 0 kerentanan
npm run build:cf      # build OpenNext
```

CI di GitHub menjalankan typecheck + unit + audit + design gate + Playwright
smoke ke produksi + Lighthouse. Semua harus hijau.

---

## 6. Deployment

```bash
npm run deploy
# = opennextjs-cloudflare build && wrangler deploy
```

Domain: `giadeliksari.my.id` (+ `www`), fallback
`gia-deliksari-web.zzdree.workers.dev`.

**Peringatan jaringan:** di mesin Linux ini IPv6 mati. Kalau `wrangler`
mengalami `fetch failed`, paksa IPv4 dulu.

---

## 7. Migrasi D1

```bash
# schema + seed (sekali, dari nol)
npm run d1:migrate:remote
npm run d1:seed:remote

# migrasi individual
npx wrangler d1 execute gia-deliksari-db --remote \
  --file=./migrations/0003_add_announcement_end_date.sql
```

`0003` **sudah diterapkan** ke produksi 15 Okt 2026 (kolom `end_date`
ditambahkan ke `announcements`, terverifikasi lewat `pragma_table_info`).

---

## 8. Kredensial lokal

`~/.bashrc` menyediakan `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_EMAIL`,
`CLOUDFLARE_API_KEY` (Global API Key — **bekerja**). `CLOUDFLARE_API_TOKEN`
di baris 194 **dikomentari karena invalid**.

Script backup menerima keduanya: `Bearer` untuk token CI, `X-Auth-Email` /
`X-Auth-Key` untuk Global Key lokal. Jalankan lokal dengan:

```bash
SYNC_SHEETS=false node scripts/backup-d1-to-sheets.mjs
```
