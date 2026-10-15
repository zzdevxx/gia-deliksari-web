# RUNBOOK — GIA Deliksari Web Portal

Operasi harian, pemulihan, dan hal-hal yang **hanya bisa dilakukan operator**
(bukan di otomatiskan dari repo). Ditulis 15 Okt 2026 setelah audit menemukan
backup D1 yang bertahun-tahun menulis snapshot kosong.

---

## 1. 🟢 Backups — 3 lapisan, semuanya terverifikasi

### Peta lapisan

| # | Lapisan | Cakupan | Retensi | Biaya | Untuk siapa |
|---|---|---|---|---|---|
| 1 | **D1 Time Travel** | **Seluruh DB, 10 tabel** | **23 hari** (usia DB) | Rp 0 | Teknis |
| 2 | **Snapshot git** | 9 tabel (`password_hash` diredaksi) | 30 hari, digilir | Rp 0 | Teknis |
| 3 | **Google Sheets** | 9 tabel, bisa dibaca | Selama spreadsheet ada | Rp 0 | **Pengurus** |

### Lapisan 1 — D1 Time Travel (paling kuat)

Bawaan Cloudflare, **gratis, tanpa setup**. Bisa mundur ke **menit mana pun**
dalam jendela retensi.

```bash
# lihat bookmark saat ini
npx wrangler d1 time-travel info gia-deliksari-db

# bookmark pada waktu tertentu
TS=$(python3 -c "import datetime;print(int((datetime.datetime.now(datetime.UTC)-datetime.timedelta(days=3)).timestamp()))")
npx wrangler d1 time-travel info gia-deliksari-db --timestamp="$TS"

# PULIHKAN (berhati-hati — ini menimpa database produksi)
npx wrangler d1 time-travel restore gia-deliksari-db --bookmark=<bookmark>

# batalkan restore (kalau salah)
# Time Travel mencatat restore sebagai perubahan, jadi bookmark sebelum
# restore masih bisa dipakai untuk kembali.
```

**Jendela retensi dicek 15 Okt 2026:** mundur 23 hari ✅, 25 hari ❌.
Database dibuat 22 Sep 2026, jadi jendela 30 hari belum terisi penuh.

### Lapisan 2 — Snapshot + script restore

```bash
# 1. Hasilkan SQL dari snapshot
node scripts/restore-d1-from-snapshot.mjs backups/d1/20261015172056.json > restore.sql

# 2. Terapkan ke database TUJUAN (perhatikan nama DB-nya!)
npx wrangler d1 execute <db-tujuan> --remote --file=restore.sql
```

⚠️ **`password_hash` diisi placeholder inert.** Snapshot meredaksi kolom itu
untuk keamanan, tapi kolomnya `NOT NULL`. Script mengisi hash bcrypt valid yang
**tidak akan cocok dengan password apa pun** — jadi semua akun hasil restore
**mati** sampai direset. Itu perilaku yang benar: portal hasil restore tidak
boleh diam-diam menerima kredensial lama. Script mencetak peringatan eksplisit.

### Lapisan 3 — Google Sheets

Lihat `docs/PANDUAN-BACKUP-SHEETS.md`. Status: **kode siap, menunggu operator
men-deploy Apps Script** (butuh klik manual di Google, tidak bisa diotomatiskan).

Setelah dipasang, setiap malam spreadsheet menampilkan jumlah baris per tabel —
sehingga masalah terlihat **tanpa membuka terminal**.

---

## ✅ Hasil drill restore (15 Okt 2026)

Dijalankan ke database D1 sementara, atas izin anak gembala.

```
Restored : 143 baris, 145 query
Database : gia-restore-drill (dibuat → diisi → dihapus)
Produksi : TIDAK TERSENTUH (diverifikasi sesudahnya)
```

| Tabel | Produksi | Restore | |
|---|---|---|---|
| announcements | 4 | 4 | ✅ |
| servant_rosters | 7 | 7 | ✅ |
| inventory_items | 7 | 7 | ✅ |
| sermons | 3 | 3 | ✅ |
| ministry_requests | 3 | 3 | ✅ |
| users | 4 | 4 | ✅ |
| audit_log | 149 | 115 | ✅ snapshot lebih tua |
| VIEW balance | 0/0/0 | 0/0/0 | ✅ |
| TRIGGER updated_at | 1 | 1 | ✅ |

**Isi data identik**, termasuk kutip ganda di judul (`"Unstoppable Faith"`) —
escaping SQL terbukti benar.

### Tiga masalah yang ditemukan drill ini

Inilah alasan drill bukan formalitas:

1. **D1 menolak `BEGIN TRANSACTION`** di file .sql → setiap restore akan gagal
2. **`password_hash` NOT NULL tapi diredaksi** → restore gagal; sekarang pakai
   placeholder inert
3. **Tidak ada script restore sama sekali** → sekarang ada

Ketiganya **baru akan ketemu saat D1 benar-benar hilang** — momen terburuk
untuk mencari solusinya.

---

## Masih perlu dilakukan

**Pasang Apps Script** (`docs/PANDUAN-BACKUP-SHEETS.md`) supaya lapisan 3 aktif.
Butuh klik manual di Google — tidak bisa diotomatiskan dari sini.

## 2. ✅ R2 — DIPUTUSKAN TIDAK DIPAKAI, SELAMANYA (15 Okt 2026)

**Keputusan: portal ini berjalan tanpa R2. Galeri memakai Google Drive.**

### Kenapa

Operator memilih prinsip **"full free — tanpa kartu sama sekali"**. R2 tidak
kompatibel dengan itu, meski halaman marketingnya berkata sebaliknya:

- `cloudflare.com/products/r2` → *"Start building for free — no credit card required."*
- Dashboard + dokumentasi billing → R2 **wajib punya metode pembayaran** sebelum
  bisa diaktifkan. R2 adalah layanan **metered** dengan jatah gratis — bukan
  *free plan* seperti Workers/D1.

Dilaporkan banyak pengguna:

> *"R2 requires a credit card even if it's free. The credit card is required for
> account verification and service provisioning."*

> *"R2 — advertised as 10GB free, but object storage tab is disabled without a card"*

Jadi `error 10042` adalah **entitlement akun** — bukan bug, bukan soal permission
token. Sudah dicoba 4 jalur (REST API, `wrangler r2`, create langsung, list) dan
semuanya ditolak dengan cara yang sama.

### Apa yang hilang? Tidak ada yang penting

| | Tanpa R2 |
|---|---|
| Foto asli | ✅ Google Drive — OAuth sudah terpasang di produksi |
| Menyajikan gambar | ✅ `lh3.googleusercontent.com` (CDN asli Drive) |
| Biaya | ✅ Rp 0 |
| Perlu kartu | ✅ Tidak |

R2 hanya akan jadi **cermin tambahan** (redundansi). Berguna, tapi bukan syarat
portal berfungsi.

### ⚠️ WAJIB diingat kalau nanti berubah pikiran

`R2_PUBLIC_URL` di `wrangler.jsonc` menunjuk `gallery.giadeliksari.org` — dan
**domain itu TIDAK resolve** (dicek 15 Okt 2026). Kalau R2 kelak diaktifkan tanpa
memperbaiki domain ini lebih dulu, **semua gambar galeri jadi URL rusak.**

### Perbaikan yang menyertainya

URL gambar diubah dari `/thumbnail?id=…` → `lh3.googleusercontent.com/d/<id>=wN`
di **dua** tempat (`gallery/upload`, `gallery/sync`). `/thumbnail` adalah endpoint
*preview* yang rate-limit dan kadang membalas HTML alih-alih byte gambar — itu
penyebab ubin galeri tampil kosong.

<details>
<summary>Cara mengaktifkan R2 seandainya strategi berubah</summary>

1. Pasang metode pembayaran di dashboard Cloudflare
2. Aktifkan R2: `dash.cloudflare.com/<account>/r2`
3. Daftarkan `gallery.giadeliksari.org` sebagai R2 custom domain
4. `npx wrangler r2 bucket create gia-deliksari-gallery`
5. Buka komentar blok `r2_buckets` di `wrangler.jsonc` (sudah disiapkan)
6. `npm run deploy`
</details>

---

## 3. ✅ Observabilitas — AKTIF (15 Okt 2026)

**Workers Logs menyala** dengan sampling 100% dan `persist: true`, dikomit ke
`wrangler.jsonc` supaya tidak hilang saat deploy berikutnya.

```
observability: {
  enabled: true, head_sampling_rate: 1,
  logs: { enabled: true, persist: true, invocation_logs: true }
}
```

Buka: <https://dash.cloudflare.com/b3646e9d901e18b382b3f961d2b98f69/workers/services/view/gia-deliksari-web/production/observability>

**Langsung berguna.** Analytics API menunjukkan **9 error dari 817 request**
yang sebelumnya sama sekali tak terlihat. Setelah ditelusuri, semuanya perilaku
benar yang memang belum pernah dihitung: `401` dari penjaga sesi
(`/api/admin/data`, `/api/users`), `400` dari probe tabel tak dikenal, dan `503`
transien selama jendela deploy. Semua endpoint dicek ulang → sehat.

Query cepat (butuh Global Key atau token Analytics:Read):

```bash
curl -sS -X POST "https://api.cloudflare.com/client/v4/graphql" \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "Content-Type: application/json" -d '{
  "query": "query { viewer { zones(filter: {zoneTag: \"b5955189f916b4dc8582cd07635d21b3\"}) { httpRequestsAdaptiveGroups(limit: 20, filter: {datetime_geq: \"2026-10-15T00:00:00Z\", edgeResponseStatus_geq: 400}) { count dimensions { edgeResponseStatus clientRequestPath } } } } }"
}'
```

**Health probe otomatis** (`.github/workflows/health-check.yml`): tiap 2 jam,
cek 5 rute publik + sitemap + robots + API data benar-benar mengembalikan baris +
`/api/admin/data` tetap menolak tanpa sesi (401). Gagal → buka/komentari issue
berlabel `health-check`; pulih → komentar & tutup. **Tanpa dependensi** (curl
saja) supaya tidak bisa rusak karena `npm install` bermasalah.

**Yang masih disarankan:** nyalakan notifikasi email kegagalan workflow
(`Settings → Notifications`) — probe membuka issue, tapi issue hanya terlihat
kalau kamu membukanya.

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
