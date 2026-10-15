# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Jemaat GIA Deliksari**: Warga gereja dari berbagai generasi (anak-anak, pemuda/mahasiswa UNNES, kaum wanita HANA, kaum bapak, dan lansia) yang membutuhkan akses cepat ke jadwal ibadah mingguan, warta jemaat, materi buletin A4 siap-cetak, dan arsip khotbah YouTube.
- **Tamu & Mahasiswa Baru (Kawasan Sekaran / UNNES)**: Pendatang baru di sekitar kampus UNNES Gunungpati yang mencari tempat beribadah, panduan kunjungan onsite pertama kali, lokasi Google Maps, dan kontak pastoral via WhatsApp.
- **Pelayan Jemaat (Servant Team)**: Petugas ibadah (WL, Singer, Pemain Musik, Multimedia, Sound System, Usher) yang memantau plotting jadwal roster mingguan dan konfirmasi pelayanan.
- **Pengurus & Majelis Gereja (Admin & Superuser)**: Tim sekretariat, gembala sidang, dan bendahara pemuda yang mengelola data warta, permohonan doa/sakramen jemaat, inventaris alat, dan buku kas operasional.

## Product Purpose

Portal web resmi dan platform operasional digital terpadu untuk Gereja Isa Almasih (GIA) Deliksari Semarang. Platform ini menyediakan transparansi informasi ibadah, kemudahan permohonan pelayanan pastoral dan sakramen, transparansi persembahan digital QRIS, serta sistem manajemen operasional gereja (CMS & Buku Kas) yang terintegrasi secara 100% serverless di Cloudflare Workers dan D1.

## Positioning

"Growing Church!" — Gereja yang hangat, ramah bagi generasi muda dan mahasiswa di kawasan kampus UNNES Sekaran, sekaligus berakar kuat pada nilai-nilai keluarga Allah yang kudus, bertanggung jawab, dan bersahaja. Berbeda dengan web korporat atau template gereja instan, portal ini menyajikan data liturgis dan warta yang selaras secara realtime dengan database Cloudflare D1 jemaat tanpa jeda dan tanpa ketergantungan pihak ketiga yang berat.

## Operating Context

- **Domain Utama**: `https://giadeliksari.my.id` dan `https://www.giadeliksari.my.id` (Cloudflare Workers & D1).
- **Infrastruktur**: 100% Cloudflare Native (OpenNext on Cloudflare Workers, Cloudflare D1 SQLite `gia-deliksari-db` region APAC/SIN). Seluruh dependensi Supabase dan Vercel telah dihapus permanen.
- **Ibadah Rutin**:
  - Ibadah Raya Minggu: 09.00 – 11.00 WIB (Gedung Utama / Sanctuary).
  - COC Kidz (Sekolah Minggu): Minggu, 09.30 – 10.30 WIB (Ruang Bethel).
  - Grow Generation Youth: Sabtu, 18.00 – 20.00 WIB (Gedung Utama / Bethel, bergantian dengan Komsel).
  - Ibadah Doa Pagi: Selasa – Jumat, 05.00 – 05.30 WIB (Gedung Utama + Zoom).
  - Wanita HANA & Komsel Ekklesia: Jumat 17.30 WIB & Selasa 18.30 WIB.
- **Alamat Fisik**: Jl. Kolonel HR Hadijanto, Sekaran, Kec. Gunungpati, Kota Semarang, Jawa Tengah 50229 (kawasan UNNES).

## Capabilities and Constraints

- **Halaman Publik**:
  - `/home`: Beranda pengenalan gereja, panduan tamu onsite, profil penggembalaan, 4 pilar komunitas, bagan struktur kepengurusan pelayanan, lokasi & kontak.
  - `/info`: Warta jemaat berkategori dengan hitung mundur hari-H, agenda ibadah sepekan, jadwal roster pelayan dengan format salin WhatsApp 1-klik, dan rute cetak buletin mandiri A4 (`/info/print`).
  - `/media`: Pemutar video khotbah YouTube Data API v3 (mode hemat kuota) dan galeri dokumentasi foto Google Drive.
  - `/layanan`: Formulir permohonan doa, konseling pastoral, pendaftaran sakramen baptisan/anak, komsel Ekklesia, dan relawan (dengan normalisasi format nomor WhatsApp otomatis `628xx`).
  - `/persembahan`: Transparansi 4 pos persembahan, 3 kotak offline di lobi, salin rekening bank BCA & BRI 1-klik, dan modal dialog QRIS digital nasional.
- **Portal Terproteksi (RBAC Multi-Role)**:
  - `/admin`: CMS operasional warta, roster pelayan, inventaris kesiapan ibadah, permohonan jemaat (`super` | `admin`).
  - `/super`: Manajemen user multi-role dan soft-deactivation (`super` only).
  - `/kas`: Buku kas pemuda Grow Generation dan saldo realtime (`super` | `treasurer`).
- **Autentikasi**: Cookie session `gia_session` bertandatangan HMAC-SHA256, bcrypt cost 10, rate limit login 3x gagal per 5 menit.

## Brand Commitments

- **Identitas Resmi**: Gereja Isa Almasih (GIA) Deliksari Semarang.
- **Slogan / Visi**: "Growing Church!" (Kolose 2:6-7 — Berakar dan dibangun di dalam Kristus).
- **Logo Resmi**: Crimson red `#B8322F` solid emblem 1080x1080 di `public/images/logo.png`.
- **Hotline Pastoral Resmi**: WhatsApp `0896-2096-1103` / `+62 896-2096-1103`, email `giadeliksarichurch@gmail.com`.
- **Media Sosial Resmi**: Instagram `@giadeliksari`, YouTube `@GIADeliksariSemarang`.

## Evidence on Hand

- Dokumen Single Source of Truth: `INFO.md` (identitas, alamat, kontak, struktur organisasi lengkap, jadwal ibadah sepekan, inventaris, dan akun produksi).
- Basis Data: Cloudflare D1 Serverless SQLite `gia-deliksari-db` (`0f8a9e42-0a14-4a45-9cbb-55f7d8b2f5f1`).
- Pengujian: 26 unit tests passing (Vitest + JSDOM di `tests/unit/`).

## Product Principles

1. **Sacred Reverence over SaaS Novelty**: Menampilkan atmosfer yang tenang, kudus, hangat, dan bermartabat. Menolak efek generik AI-slop seperti neon glow, floating orbs, glassmorphism berlebihan, dan animasi bounce yang mengganggu kekhidmatan.
2. **Accessible for All Generations**: Desain harus sangat mudah dibaca oleh jemaat senior/lansia (kontras teks tinggi WCAG AAA, ukuran font jelas) sekaligus segar dan relevan bagi mahasiswa serta pemuda.
3. **Data Integrity & Truthfulness**: Informasi jadwal, nomor rekening persembahan (BCA & BRI), dan kontak pastoral harus 100% valid dan faktual sesuai naskah `INFO.md`. Dilarang menampilkan data simulasi palsu pada halaman publik.
4. **Restrained Liturgical Color (10% Rule)**: Satu warna jenuh — Sacred Wine pada hue kanonik 14.1° (`#8E1533`) — dipakai hemat sebagai aksen fokus (≤10%), sementara 90% kanvas didominasi netral hangat (light `#FAF9F8` / dark `#0A0A0E`). Tidak ada emas maupun tone wine/terakota/plum sebagai keluarga kategori.

## Accessibility & Inclusion

- Standar kepatuhan kontras minimum WCAG AA (rasio kontras teks utama terhadap kanvas >= 7:1; teks sekunder >= 4.5:1).
- Target sentuh kontrol tombol dan navigasi mobile minimum 44x44px.
- Dukungan mode terang (`#FAF9F8`) dan mode gelap (`#0A0A0E`) yang nyaman di mata tanpa silau dan tanpa bias merah pekat.
