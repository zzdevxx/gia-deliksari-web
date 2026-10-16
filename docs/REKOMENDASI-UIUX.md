# 📐 Rekomendasi UI/UX dari Riset Referensi

**Tanggal:** 16 Oktober 2026
**Metode:** 5 agent riset paralel (situs gereja nyata, Dribbble, pola 2026, konteks Indonesia), 817k token, lalu **diverifikasi manual terhadap kode.**

> ⚠️ **Penting:** Hasil sintesis otomatis riset ini memuat **4 rekomendasi yang salah
> sasaran atau sudah dikerjakan.** Semua sudah ditandai di bawah. Jangan
> menerapkan rekomendasi riset tanpa memverifikasi dulu ke kode.

---

## 🔴 Yang riset salah klaim

| Rekomendasi riset | Kenapa salah |
|---|---|
| "Ganti 98 card di **warta/roster** jadi list" | 98 kartu itu di **`/home`**, bukan warta/roster. Dan `/info` **sudah** pakai `<table>` untuk roster (`info/page.tsx:657`). |
| "Hapus semua `shadow-md`/`lg`" | **Sudah** — sisa 1 di seluruh `src/` |
| "Glass cap 1-2 elemen" | **Sudah** sebelum riset (navbar + 2 kartu hero) |
| "Two-mode light+dark" | **Sudah ada sejak lama** |

Sebabnya jelas: agent riset tidak tahu apa yang sudah dikerjakan di sesi sebelumnya.

---

## ✅ Yang diterapkan (dari riset)

### 1. Time-as-Button ⭐
**Sumber:** Cornerstone Church Athens
**Commit:** `e87d928`

Jam ibadah `09.00` di statistik hero diubah dari teks mati menjadi **link ke
`#kunjungan`**. Waktu ibadah adalah fakta paling berniat di halaman — jemaat
tinggal ketuk dan langsung ke form kunjungan.

Ukuran terverifikasi: 59×28px (nyaman untuk tap).

### 2. Kartu span-2 pemecah grid ⭐
**Sumber:** Church of the City
**Commit:** `e87d928`

Kartu pilar pertama melebar 2 kolom (1216px vs 592px di viewport 1280px).
Grid 4 kartu identik tidak memberi mata titik masuk, dan memaksa pembaca
memindai keempatnya untuk tahu tidak ada yang bisa dipilih di antaranya.

**Catatan implementasi:** `col-span` harus di **anak langsung grid**
(`RevealItem`), bukan di `<article>` di dalamnya. Percobaan pertama gagal
karena diletakkan di article.

### 3. Scroll cue dihapus
**Commit:** `ee5613b`

"Scroll" + ikon mouse beranimasi dihapus. Ada di daftar larangan panduan
desain, dan section berikutnya hanya 1 layar di bawah.

### 4. Hover depth di kartu interaktif
**Commit:** `ee5613b`

Kartu pilar dapat border menegas + `shadow-sm` **saat hover saja**. Ini satu-
satunya tempat shadow benar di kartu ber-border: shadow yang **muncul saat
hover** adalah feedback; yang **menetap** adalah dekorasi (119 sudah dihapus).

---

## 📊 Perbandingan terukur dengan situs gereja nyata

Diukur dengan Playwright pada viewport 390×844:

| Situs | Tinggi | H1 |
|---|---|---|
| Cornerstone Church Athens | **5.2× layar** | "Making Jesus Known" |
| Anchor Church Tacoma | **5.4× layar** | "ANCHOR" |
| Church of the City Nashville | **9.4× layar** | "Practicing the Way of Jesus." |
| **GIA Deliksari (kita)** | **14.1× layar** | "Rumah Kasih, Pertumbuhan Rohani & Pengharapan" |

**Kita 1.5-2.7× lebih panjang.** Tapi itu **bukan otomatis buruk**:

- Mereka bergaya *"rasakan dulu, informasi nanti"* — cocok untuk gereja besar
  multi-cabang dengan staf media penuh waktu.
- Kita bergaya *"semua informasi tersedia"* — cocok untuk gereja lokal satu
  lokasi. Jemaat yang datang memang mencari jadwal, alamat, dan komunitas.

**Di mana kita unggul:** palet punya identitas (mereka hitam/putih polos), dan
informasi praktis langsung terlihat tanpa klik tambahan.

---

## 💡 Ide yang belum dikerjakan

### Navigasi ikon besar (dari Cornerstone)
Mereka menaruh **5 aksi utama sebagai ikon besar** tepat di bawah header:
Events · Give · Watch · Visit · About. Terlihat tanpa perlu buka menu.

**Kenapa cocok untuk kita:** jemaat 60-70 tahun lebih mudah mengenali ikon
besar daripada membaca menu. Kita sekarang menyembunyikan navigasi di hamburger
di bawah `lg`.

**Risiko:** menambah tinggi header. Perlu diuji apakah mengganggu hero.

### Satu kartu span-2 di section lain
Berhasil di pilar komunitas. Kandidat berikutnya: galeri, atau kartu warta di
`/info`.

### Filter dua-sumbu (dari ICF Movement)
Mereka memfilter event pada **dua sumbu independen**: tanggal (Hari ini /
Minggu ini / Bulan ini) × bahasa. Untuk kita: kategori × waktu
(mendatang/lampau). Lebih berguna di HP daripada kalender penuh.

---

## 🚫 Yang JANGAN dilakukan (meski terlihat keren)

Riset menemukan satu referensi Dribbble yang secara eksplisit **salah untuk kita**:

> **"The Haven Church"** (Phenomenon Studio) — homepage sinematik hitam
> `#060202` + merah poster `#E92404`. Copy konsepnya menyatakan desainnya
> **menggantikan "doctrine or schedules"** dengan mood dan ruang bernapas.
>
> Ditandai **`works_for_us: false`** — *"This is the reference the brief warns
> about. Its own description says the point is to NOT show schedules, while our
> portal exists to publish Mass times, address, and announcements legibly."*

Daftar larangan lain yang dikonfirmasi riset:
- Palet coklat/krem/emas — sudah 3× keluhan "looks brown"
- Gradient berat — dilarang DESIGN.md
- `rounded-full` pada card biasa — hanya badge/pill
- `shadow-lg`/`2xl` — dilarang total
- Glass di banyak kartu — frame drop + kontras turun

---

## Sumber

**Situs gereja nyata (dibaca strukturnya):**
- Church of the City — cotc.com
- Anchor Church — anchortacoma.org
- Cornerstone Church Athens — cornerstoneathens.cc
- ICF Movement — icf.church
- Passion City Church — passioncitychurch.com
- Motivation Church — motivation.church

**Design gallery:** Dribbble (Sagrada Familia mobile redesign oleh Ronas IT
ditandai berguna; The Haven Church ditandai tidak berguna)

**Pola 2026:** NN/g dan lain-lain soal card vs list, scroll-driven animation,
dan status glassmorphism

---

## 🔴 TEMUAN BARU (16 Okt 2026) — QRIS di `/persembahan` tidak bisa dipindai

Saat membereskan warna hardcoded di `GivingSection.tsx`, ditemukan hal yang
jauh lebih penting daripada warnanya:

**QR yang ditampilkan adalah SVG hiasan, bukan kode QR.**

- `GivingSection.tsx:305` dan `:420` — komentar di kode sendiri menyebutnya
  *"Stylized QR Code SVG"*.
- Isinya **27 `<rect>` tangan**, bukan matriks modul. QR asli butuh ratusan
  modul (versi terendah pun 21×21 = 441 sel); 27 kotak tidak bisa meng-encode
  apa pun.
- **Tidak ada data terenkode di dalamnya.** Titik tengahnya malah monogram
  gereja (lingkaran + garis salib).

**Kenapa ini serius:** label di sekitarnya berbunyi:

| Teks di UI | Kenyataannya |
|---|---|
| "Scan & Bayar (QRIS)" | tidak ada yang bisa dipindai |
| "Klik untuk Perbesar QRIS" | memperbesar gambar hiasan |
| "Buka QRIS Layar Penuh" | memperbesar gambar hiasan |
| "SCAN QRIS RESMI DI MEJA PENERIMAAN GEREJA" | ⚠️ kontradiksi: gambar di layar bukan QR resmi |

Jemaat yang membuka `/persembahan` di HP akan mencoba memindai layarnya,
gagal, dan tidak tahu kenapa. Yang lebih buruk: keterangan
*"SCAN QRIS RESMI DI MEJA PENERIMAAN GEREJA"* menempel pada gambar yang
**bukan** QR resmi, sehingga layar dan kenyataan saling bertentangan.

**Yang masih benar di halaman itu:** transfer bank BCA (`2521151515`) dan BRI
(`034201001515150`) dengan tombol salin — nomornya nyata dan berfungsi. Jadi
jemaat masih punya jalur yang sah; hanya jalur QRIS yang menyesatkan.

**Catatan tambahan:** admin **tidak punya** tempat mengunggah QRIS asli
(dicari di `src/components/admin/` dan `src/components/super/` — nol hasil).
`seedData.ts:296` menyebut "QRIS Standee" sebagai **inventaris fisik**
(`IBD-QRIS-01`, "Code QR ditempel di standee"), bukan aset digital.

### Dua pilihan perbaikan

**A. Jujur tanpa aset baru (bisa dikerjakan sekarang):**
Ganti blok QR dengan keterangan bahwa QRIS hanya tersedia **fisik di gedung**,
dan arahkan ke transfer bank + WhatsApp pastoral. Menghapus gambar yang tidak
berfungsi lebih baik daripada membiarkannya terlihat bisa dipindai.

**B. QRIS asli (butuh aset dari pengurus):**
Minta gambar QRIS resmi dari pengurus gereja (PNG dari m-banking), unggah ke
`public/`, dan tampilkan sebagai `<img>`. Sekaligus tambahkan kolom di admin
supaya bisa diganti tanpa deploy.

**Rekomendasi: kerjakan A sekarang, siapkan B** saat pengurus mengirim
gambar QRIS resminya. Membiarkan keadaan sekarang berarti setiap jemaat yang
mencoba memindai mengalami kegagalan yang tidak bisa mereka jelaskan.

---

## 🔴 TEMUAN REVIEW ADVERSARIAL (16 Okt 2026)

Review 26 agen (4 lensa × verifikasi 2 hakim) atas pekerjaan sesi ini menemukan
**5 bug nyata** yang lolos dari semua test dan pemeriksaan manual sebelumnya.

### 1. Focus ring tidak terlihat di dark mode — 48 tempat, 11 file

`--brand` bernilai `#8E1533` **di kedua tema**. Di atas kartu gelap (`#1B1B24`)
kontrasnya **1.88:1**, jauh di bawah lantai 3:1 yang WCAG 1.4.11 tetapkan untuk
indikator fokus. Artinya **pengguna keyboard di dark mode tidak bisa melihat
posisi fokusnya sama sekali**.

Kenapa lolos: di light mode rasionya **9.11:1** (tampak benar), dan nilainya
token brand, bukan angka yang mencurigakan.

**Perbaikan:** semua pakai `--ring` — token yang **sudah ada** di `globals.css`
(`#8E1533` light / `#F08AA4` dark) untuk tugas ini, tapi **0 pemakaian** sejak
dibuat. Sekarang 36 pemakaian. Dikunci `tests/unit/focus-contrast.test.ts` yang
memindai seluruh `src/`.

### 2. Ikon kalender di 45% opacity = 2.48:1

Lulus hanya saat hover — dan **HP tidak punya hover**. Dinaikkan ke 60%
(≥3.5:1 di semua warna kartu, kedua tema); hover kini menambah ketegasan,
bukan satu-satunya cara melihat.

### 3. Kartu Youth punya bug yang sama dengan kartu HANA

Prosa menyebut "M2 & M4 Ibadah Komsel Sel" tapi unduhannya cuma
`grow-generation`. **Test lama tidak menangkapnya** karena hanya memeriksa
kartu yang labelnya mengandung kata "dan" — label kartu Youth tidak
mengandungnya, jadi tidak ada yang membandingkan label dengan isi. Test
sekarang menurunkan pasangan dari **sumber jadwal**, bukan frasa label.

### 4. Empat dokumen mengiklankan "modal QRIS digital" yang sudah dihapus

Termasuk `INFO.md:263` yang **mendeklarasikan dirinya Single Source of Truth**,
sementara `PRD.md:223` menyuruh maintainer *"update INFO.md dulu sebelum ubah
code"*. Jadi baris basi itu duduk di dokumen yang paling dipercaya. Diperbaiki
di `README.md` (2 baris), `INFO.md`, `PRD.md`, `PRODUCT.md`.

### 5. Petunjuk arah salah di HP

Kartu QRIS bilang "transfer bank **di samping**". Di HP kartu bertumpuk dan
kartu bank ada **di atas**, jadi arahnya menunjuk ke tempat yang salah.
Diganti "kartu transfer bank di halaman ini".

### Pelajaran yang berlaku umum

- **Test yang hanya memeriksa satu kasus akan lolos pada kasus kedua.** Kedua
  bug kartu (HANA lalu Youth) berbentuk sama; test pertama terlalu spesifik
  sehingga memberi rasa aman palsu.
- **Uji nilai warna dan opacity, bukan hanya perilaku.** Tiga dari lima temuan
  hanya bisa ditangkap dengan mengukur kontras.
- **Token yang benar sering sudah ada tapi tidak dipakai.** `--ring` sudah
  didefinisikan sejak awal dengan nilai yang tepat per tema.
