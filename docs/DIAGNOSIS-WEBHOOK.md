# 🔍 Diagnosis Webhook Backup — Hasil Uji

**Waktu:** 15 Okt 2026, 18:51 UTC
**URL:** `https://script.google.com/macros/s/AKfycbyq.../exec`

---

## Hasil uji

| Uji | Hasil | Artinya |
|---|---|---|
| `GET` webhook | ✅ **200 OK, JSON benar** | Script **jalan** dan akses publik **OK** |
| `POST` (JSON) | ❌ 302 → **405** | Google mengubah POST → GET |
| `POST` (form) | ❌ 302 → **405** | Sama |
| `POST` (text/plain) | ❌ 302 → **405** | Sama |

**Respons GET yang benar:**
```json
{"ok":true,"pesan":"Webhook backup GIA Deliksari aktif. Kirim POST untuk mengisi data."}
```

---

## Kesimpulan

Webhook-mu **hidup dan bisa diakses publik** — itu bagian tersulit, dan kamu
sudah berhasil. ✅

Masalahnya: **POST tidak sampai ke `doPost()`**. Google mengembalikan `302`
redirect ke `script.googleusercontent.com`, dan di sana POST berubah jadi GET →
405 "Halaman Tidak Ditemukan".

Ini **bukan** masalah kode — kodenya benar. Ini masalah **konfigurasi deployment**.

---

## Yang perlu kamu cek (2 kemungkinan)

### Kemungkinan A — Deploy belum pakai versi terbaru ⭐ paling sering

Kalau kamu **mengedit kode SETELAH deploy**, Apps Script masih menjalankan
versi lama (yang mungkin belum ada `doPost`-nya).

**Cara perbaiki:**

1. Buka Apps Script → pastikan kodenya masih utuh
2. Klik **[Deploy]** → **Manage deployments**
3. Klik ikon **✏️ pensil** pada deployment yang ada
4. Di bagian **Version**, pilih **New version**
5. Klik **[Deploy]**

> Penting: **New version**, bukan "Version 1". Kalau masih "Version 1",
> perubahan kode tidak ikut.

### Kemungkinan B — Setelan akses

1. **[Deploy]** → **Manage deployments** → ✏️
2. Pastikan:
   - **Execute as** = `Me (emailmu)`
   - **Who has access** = **`Anyone`**
3. Kalau bukan `Anyone`, ganti → **[Deploy]**

---

## Cara mengetes setelah diperbaiki

Setelah deploy ulang, saya uji lagi dari sini. Tapi kamu juga bisa tes sendiri:

```bash
curl -sSL -X POST "URL_WEB_APP_KAMU" \
  -H "Content-Type: application/json" \
  -d '{"secret":"SECRET_KAMU","data":{"announcements":[{"id":"tes","title":"Uji Coba"}]}}'
```

**Yang harus muncul** (kalau secret benar):
```json
{"ok":true,"ditulis":{"Warta":1,...},"timestamp":"..."}
```

**Kalau muncul** `{"ok":false,"error":"secret tidak cocok"}` → berarti POST
sudah sampai, cuma secret salah. Itu **kabar baik** — berarti sudah beres.

**Kalau masih HTML/405** → kemungkinan A belum benar. Ulangi langkahnya.

---

## Catatan

Saya **tidak bisa** memperbaiki ini dari sini — Apps Script tidak punya API untuk
mengubah deployment. Ini murni klik di dashboard Google.

Screenshot halaman **Manage deployments** kalau mau saya cek.
