# 📊 Layer 3 — Backup ke Google Sheets

Panduan untuk memasang backup lapisan ketiga: snapshot database yang bisa
**dibaca pengurus gereja tanpa keahlian teknis**, langsung di Google Sheets.

---

## Kenapa perlu lapisan ini?

Kamu punya 3 lapisan backup. Ini perbandingannya:

| Lapisan | Untuk siapa | Cara pakai |
|---|---|---|
| **1. D1 Time Travel** | Teknis | `wrangler d1 time-travel restore` — mundur ke menit mana pun, 23 hari |
| **2. Snapshot git** | Teknis | File JSON di `backups/d1/` — butuh script untuk memulihkan |
| **3. Google Sheets** | **Pengurus gereja** | Buka spreadsheet, langsung baca ✅ |

Lapisan 1 & 2 sudah aktif. Lapisan 3 belum — dan itu yang bisa diakses
**tanpa laptop, tanpa terminal, tanpa kamu**.

---

## Yang dibutuhkan (jawaban pertanyaan "API key-nya mana?")

Kamu sudah punya banyak kredensial Google, tapi **tidak satu pun cocok**:

| Kredensial | Fungsinya | Bisa untuk Sheets? |
|---|---|---|
| `GOOGLE_DRIVE_API_KEY` | Baca file Drive publik | ❌ API key hanya bisa baca |
| `GOOGLE_SERVICE_ACCOUNT_*` | Upload ke Drive | ❌ Harus di-*share* manual tiap spreadsheet |
| `GOOGLE_OAUTH_*` | Upload Drive atas namamu | ⚠️ Perlu scope baru + login ulang |
| **Webhook Apps Script** | **Tulis ke Sheets** | ✅ **Ini yang dipakai** |

**Analogi:** API key itu kunci gudang. Untuk mengisi spreadsheet, kamu butuh
**alamat rumah**-nya — dan itu URL Apps Script. Beda hal sepenuhnya.

---

## Cara pasang (± 5 menit, sekali saja)

### 1. Buat spreadsheet

Buka **https://sheets.new** → beri nama: `GIA Deliksari — Backup Database`

### 2. Buka editor script

Menu **Extensions** → **Apps Script**

### 3. Tempel kodenya

- Hapus semua isi file `Code.gs`
- Copy seluruh isi `docs/apps-script-backup.gs` dari repo ini
- Tempel

### 4. Ganti kata sandi

Cari baris paling atas:

```javascript
var SECRET = 'GANTI-DENGAN-KATA-SANDI-RAHASIA-20-KARAKTER';
```

Ganti dengan kata sandi acak buatanmu (minimal 20 karakter).
Contoh cara buat yang acak: ketik asal panjang seperti
`kucing-hijau-terbang-9127-mantap`.

> **Kenapa perlu?** Tanpa ini, siapa pun yang tahu URL-nya bisa menulis ke
> spreadsheet-mu. Ini satu-satunya pengaman.

### 5. Simpan

Ctrl+S atau ikon 💾

### 6. Deploy

| Langkah | Pilihan |
|---|---|
| Klik **[Deploy]** → **New deployment** | |
| Ikon ⚙ → pilih **Web app** | |
| Description | `GIA D1 Backup` |
| Execute as | **Me** (emailmu) |
| Who has access | **Anyone** ← WAJIB, jangan "Anyone with Google account" |
| Klik **[Deploy]** | |

Kalau muncul **"Authorize access"**:
→ pilih akunmu → **Advanced** → **Go to GIA D1 Backup (unsafe)** → **Allow**

> Tulisan *"unsafe"* itu **normal** — Google menandai semua script buatan
> sendiri begitu. Bukan virus.

### 7. Salin URL-nya

Setelah deploy, muncul **Web app URL**:

```
https://script.google.com/macros/s/AKfycb...../exec
```

**Kirim URL ini + SECRET yang kamu pilih ke Claude**, atau pasang sendiri:

```bash
gh secret set GOOGLE_SHEETS_WEBHOOK_URL --repo zzdevxx/gia-deliksari-web
gh secret set GOOGLE_SHEETS_WEBHOOK_SECRET --repo zzdevxx/gia-deliksari-web
```

---

## Cara mengetes

### Tes cepat (tanpa nunggu jadwal)

Buka URL web app-nya di browser. Kalau muncul:

```json
{
  "ok": true,
  "pesan": "Webhook backup GIA Deliksari aktif. ..."
}
```

Berarti webhook hidup. ✅

### Tes penuh

```bash
gh workflow run "D1 Backup and Google Sheets Sync" --repo zzdevxx/gia-deliksari-web
```

Buka spreadsheet-nya setelah ~1 menit. Harus muncul sheet:
`Info Backup`, `Warta`, `Roster`, `Inventaris`, `Khotbah`, `Permohonan`,
`Pengurus`, `Audit Log`.

---

## Yang akan kamu lihat di spreadsheet

Sheet **Info Backup** (paling depan) — ringkasan sekali lihat:

| Backup Terakhir | 2026-10-15T17:20:56Z |
|---|---|
| **Sheet** | **Jumlah Baris** |
| Warta | 4 |
| Roster | 7 |
| Inventaris | 7 |
| Khotbah | 3 |
| Permohonan | 3 |
| Pengurus | 4 |
| Audit Log | 115 |

Kalau ada sheet dengan jumlah **0** padahal seharusnya ada isinya → tanda ada
masalah. Inilah gunanya: masalah jadi **terlihat tanpa membuka terminal**.

> ⚠️ **Catatan keamanan:** sheet `Permohonan` memuat nomor WhatsApp dan isi
> permohonan doa jemaat. Bagikan spreadsheet ini **hanya ke pengurus**, jangan
> di-*share* ke publik.

---

## Kalau nanti mau berhenti

1. Apps Script → **Deploy** → **Manage deployments** → **Archive**
2. Hapus secret GitHub:
   ```bash
   gh secret delete GOOGLE_SHEETS_WEBHOOK_URL --repo zzdevxx/gia-deliksari-web
   gh secret delete GOOGLE_SHEETS_WEBHOOK_SECRET --repo zzdevxx/gia-deliksari-web
   ```

Backup harian tetap jalan — hanya lapisan Sheets yang berhenti.
