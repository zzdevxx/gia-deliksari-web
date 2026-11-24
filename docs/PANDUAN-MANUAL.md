# 📖 PANDUAN MANUAL — GIA Deliksari Web

Dua hal saja yang harus kamu kerjakan sendiri. Semuanya sudah saya siapkan;
kamu tinggal klik. Perkiraan total waktu: **10 menit**.

Akunmu:
- Email: **andreasr35tu@gmail.com**
- Zone: **giadeliksari.my.id** (plan Free)

---

# BAGIAN 1 — Aktifkan R2 (± 3 menit)

## Kenapa ini perlu?

Galeri foto gereja seharusnya disimpan di Cloudflare R2 (penyimpanan file).
Sekarang R2 belum aktif, jadi foto jatuh ke Google Drive.

**Kabar baiknya:** galeri saat ini **kosong** (0 foto), jadi **tidak ada yang rusak**.
Ini pekerjaan pencegahan, bukan darurat. Kalau kamu lewatkan, tidak ada yang error.

**Kalau kamu mau aktifkan**, ikuti ini:

## Langkah

**1.** Buka link ini di browser (sudah login dengan akun di atas):

```
https://dash.cloudflare.com/b3646e9d901e18b382b3f961d2b98f69/r2
```

**2.** Akan muncul halaman R2 dengan **tombol besar "Enable R2"** atau
**"Purchase R2"**. Klik.

**3.** Muncul formulir. Cloudflare **tidak meminta kartu kredit** untuk R2.
R2 punya jatah gratis 10 GB penyimpanan + 1 juta operasi/bulan.
Foto gereja tidak akan sampai angka itu.

**4.** Centang persetujuan Terms of Service → klik **Continue / Enable**.

**5.** Setelah muncul dashboard R2 (kosong, belum ada bucket), **kabari saya**.

## Setelah kamu kabari

Saya akan jalankan ini (kamu tidak perlu apa-apa):

```bash
npx wrangler r2 bucket create gia-deliksari-gallery
```

lalu buka komentar blok `r2_buckets` di `wrangler.jsonc` (sudah saya siapkan
dan beri komentar), deploy, dan verifikasi.

**Satu hal yang masih perlu keputusanmu nanti:** domain `gallery.giadeliksari.org`
dipakai untuk menyajikan foto. Domain itu **belum terdaftar / tidak resolve**.
Jadi setelah R2 aktif, saya akan tanya: mau pakai domain itu (kamu perlu
mendaftarkannya dulu), atau pakai URL R2 bawaan saja. Kita bahas nanti.

---

# BAGIAN 2 — Nyalakan Notifikasi Email (± 5 menit)

## Kenapa ini perlu?

**Ini bagian yang paling penting.** Ingat masalah backup yang menulis file kosong
selama berminggu-minggu? Itu terjadi karena **tidak ada yang memberi tahu**.

Saya sudah pasang pemeriksa otomatis (tiap 2 jam) yang akan **membuka issue**
kalau website bermasalah. Tapi issue hanya kelihatan kalau kamu buka GitHub.
Notifikasi email membuatmu **langsung tahu** tanpa harus membuka apa pun.

Tanpa ini, masalah bisa terulang dan baru ketahuan berhari-hari kemudian.

## Langkah

**1.** Buka:

```
https://github.com/settings/notifications
```

**2.** Scroll ke bagian **"Actions"**.

**3.** Cari centang yang bunyinya kira-kira:

> ☑️ **Send notifications for failed workflows only**

**Centang itu.** (Kalau ada opsi "Send notifications for all workflows",
biarkan **tidak** dicentang — kita cuma mau tahu saat gagal.)

**4.** Scroll ke bawah → klik **Save**.

## Cara mengetes

Setelah dicentang, saya bisa sengaja menjalankan health-check terhadap halaman
yang tidak ada, supaya kamu **melihat sendiri** emailnya masuk. Bilang saja
"tes notifikasi" kalau mau.

---

# BAGIAN 3 — (Opsional, nanti) Drill Restore

**Belum perlu sekarang.** Saya tulis di sini supaya kamu tahu ada di daftar.

## Apa itu?

Backup yang **belum pernah dicoba dipulihkan** itu belum terbukti berfungsi.
Analoginya: punya kotak P3K tapi belum pernah buka — belum tahu isinya lengkap
atau tidak.

Sekarang website punya backup nyata (143 baris data). Tapi kita belum pernah
menguji: "kalau D1 hilang, apakah backup ini benar-benar bisa mengembalikannya?"

## Kenapa ditunda?

Karena ini **bukan keputusan teknis, tapi keputusan pengurus gereja**. Yang
diuji adalah data jemaat (nomor WhatsApp, isi permohonan doa). Jadi sebaiknya
kamu diskusikan dulu dengan pengurus: boleh tidak menyalin data jemaat ke
database sementara untuk uji coba?

Kalau sudah dapat izin, bilang saja — prosedur lengkapnya sudah ada di
`RUNBOOK.md` bagian 1, dan saya jalankan untukmu.

---

# 🆘 Kalau Bingung di Tengah Jalan

Screenshot saja halamannya, kirim ke saya. Saya bantu arahkan.

Atau, kalau salah satu bagian terasa terlalu ribet, **lewati saja**.
Yang **wajib** hanya Bagian 2 (notifikasi). Bagian 1 dan 3 bisa nanti.

---

# 📋 Ringkasan Cepat

| # | Tugas | Wajib? | Waktu | Link |
|---|---|---|---|---|
| 1 | Aktifkan R2 | Tidak (galeri kosong) | 3 mnt | [buka](https://dash.cloudflare.com/b3646e9d901e18b382b3f961d2b98f69/r2) |
| 2 | **Notifikasi email** | **Ya** | 5 mnt | [buka](https://github.com/settings/notifications) |
| 3 | Drill restore | Nanti | — | tanya pengurus dulu |

---

## Yang Sudah Selesai (tidak perlu kamu apa-apakan)

Supaya kamu tenang, ini semua sudah jalan:

- ✅ Backup otomatis → **143 baris**, terbukti bekerja
- ✅ Token Cloudflare → dibuat & dipasang ke GitHub
- ✅ Log & monitoring → **aktif**, 100%
- ✅ Pemeriksa website tiap 2 jam → **aktif & lolos tes**
- ✅ Lockout login → **terbukti bekerja** (3x salah → dikunci 60 detik)
- ✅ Migrasi database (`end_date`) → **sudah diterapkan**
- ✅ 30+ perbaikan keamanan & bug → sudah live
