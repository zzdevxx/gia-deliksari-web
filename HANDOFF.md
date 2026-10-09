# 🤝 HANDOFF BRIEFING — GIA DELIKSARI WEB PORTAL
**Tanggal Update**: 9 Oktober 2026  
**Status**: 100% HIJAU & LIVE DI PRODUKSI  
**URL Live**: [https://giadeliksari.my.id](https://giadeliksari.my.id) (Fallback Edge: `https://gia-deliksari-web.zzdree.workers.dev`)  
**Current Worker Version ID**: `38dc955c-4d2c-4080-89fc-a893f231eb29`  
**Git Branch**: `main` (In-Sync dengan `origin/main`)

---

## 📌 Ringkasan Eksekutif untuk Agent Berikutnya

Sesi 9 Oktober 2026 menyelesaikan gelombang modernisasi visual dan perbaikan struktural:
1. **Design System "Crimson Field"**:
   - Logo `#8B1E28` berada di OKLCH hue 21.4° (zona oranye). Digeser ke hue kanonik 14.1° (`#8E1533`) agar saat digelapkan ke hitam tidak berubah jadi coklat lumpur (`#5A0F24` mempertahankan chroma 0.107 murni crimson).
   - Gradien `.gia-field` terisolasi di background Hero (`overflow-hidden`, scroll away). Semua elemen lain (kartu, tombol, typography) tetap 100% flat minimalis.
   - Zero hex literals di `src/` (444 utility dimigrasikan ke semantic tokens).
2. **Perbaikan Geometri Hero (`Hero.tsx`)**:
   - Duplikasi teks status countdown dibersihkan (hanya 1 render di semua breakpoint).
   - Floating pastoral card dipindah dari `-bottom-5/-bottom-6` ke `-bottom-14` (+5px clearance di atas teks alamat di breakpoint 375–1440px).
   - Scroll indicator diberi `pt-16` agar tidak tertabrak kartu floating pada mobile.
3. **Frosted Glass Navbar (`Navbar.tsx` & `globals.css`)**:
   - Memperbaiki keterbatasan Tailwind 3 di mana `bg-[var(--background)]/95` silently gagal menghasilkan rules CSS (sehingga navbar sebelumnya 100% transparan).
   - Dibuat semantic token eksplisit `--nav-bg` (`rgba(250, 249, 248, 0.72)` light / `rgba(10, 10, 14, 0.72)` dark) dan `--nav-border`.
   - Mengikuti aturan Anti-Slop R-10: efek glass hanya dipasang pada sticky Navbar yang melayang di atas konten scroll. Kartu warta & modul lain tetap solid/flat.
4. **Sinkronisasi Dark Mode (`ThemeProvider.tsx`)**:
   - `ThemeProvider` mengevaluasi `localStorage` dan `prefers-color-scheme` saat initial mount sehingga sinkron dengan OS dark mode tanpa kilatan putih.

---

## 🛠️ Stack & Infrastruktur Kunci

- **Framework**: Next.js 16.3.8 (App Router, Turbopack)
- **Runtime**: Cloudflare Workers via `@opennextjs/cloudflare` v1.20.6 (`nodejs_compat`)
- **Database**: Cloudflare D1 Serverless SQLite (`gia-deliksari-db`, binding: `DB`)
- **Deployment**: `npm run deploy` (`opennextjs-cloudflare build && wrangler deploy`)
- **Testing**:
  - Unit tests: `npm test` (Vitest, 26/26 passing)
  - Typecheck: `npm run typecheck` (`tsc --noEmit`, 0 error)
  - Design Linter: `npm run lint:design` (`impeccable detect src/`, 0 anti-pattern)
  - CI: GitHub Actions (`.github/workflows/ci.yml` & `lighthouse.yml`), 100% HIJAU

---

## 🚦 Aturan & Guardrail yang WAJIB Dipatuhi

1. **Dilarang Menghidupkan Vercel/Supabase**:
   Proyek ini 100% Cloudflare Native (Workers + D1 + R2). Vercel dan Supabase telah di-purge total.
2. **Dilarang Warna Coklat / Krem / Sepia**:
   Kanvas light adalah `#FAF9F8` (warm neutral), dark adalah `#0A0A0E`. Jangan kembalikan palet v4 Warm Alabaster (`#FAF7F2`, `#F3EFE6`, `#8C6826`).
3. **Aturan Flat & Anti-Slop R-10**:
   - Glassmorphism **hanya untuk Navbar**. Jangan pasang backdrop-blur di kartu warta, jadwal, form, atau modal background.
   - Jangan pasang gradien di komponen/kartu/teks. Satu-satunya gradien yang diizinkan adalah `.gia-field` di hero beranda.
4. **IPv4-First untuk Tooling Wrangler**:
   Jaringan dev Linux terkadang mengalami masalah koneksi IPv6. Bila `wrangler` mengalami fetch failure, pastikan resolve DNS via IPv4.
5. **Port Dev Server**:
   Jika menjalankan `next dev`, periksa proses yang sudah aktif. Port default bisa bergeser ke `:3100` jika port `:3000` sedang dipakai proses lain.

---

## 📋 Sisa Pekerjaan / Backlog Opsional

1. **Observabilitas**: Belum ada error tracking terintegrasi (Sentry / Cloudflare Logpush) untuk exception runtime di edge.
2. **Accessibility Lanjutan**: Focus trap pada modal mobile drawer dan modal QRIS.
3. **Data Warta di D1**: Data warta asli di D1 bertanggal September 2026 (terfilter sebagai past). Admin gereja nantinya akan menginput warta baru via `/admin`.
