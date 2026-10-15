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

### ✅ Sudah dikerjakan (15 Okt 2026)

Secret sudah terpasang dan backup CI **terbukti bekerja**:

```
gh secret list
CLOUDFLARE_ACCOUNT_ID   2026-10-15T17:20:25Z
CLOUDFLARE_API_TOKEN    2026-10-15T17:20:27Z
```

Token `gia-deliksari-d1-backup-readonly` (id `21547ef2…`) dibuat dengan
**least-privilege**: hanya `D1 Read` + `D1 Metadata Read`. Bukan Global Key.

Run pertama: **143 baris**, lolos step verifikasi. Riwayat di bawah hanya
sebagai catatan cara token itu dibuat.

<details>
<summary>Cara token dibuat (kalau perlu dibuat ulang)</summary>

Global API Key **bisa** membuat token API lewat REST (ternyata tidak harus
dashboard), asalkan `permission_groups` diisi:

```bash
# cari id permission group
curl -sS "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/tokens/permission_groups" \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  | python3 -c "import sys,json;[print(g['id'],g['name']) for g in json.load(sys.stdin)['result'] if 'D1' in g['name']]"
```

Hasil: `5b4da8a35efa4fe8be684070183cdb32` (D1 Metadata Read),
`192192df92ee43ac90f2aeeffce67e35` (D1 Read).

Lalu `POST /user/tokens` dengan kedua id itu, dan pasang nilai yang dikembalikan
lewat `gh secret set CLOUDFLARE_API_TOKEN`.

</details>

### 📜 Prosedur manual (riwayat)

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
