# Big Plan — Flat Minimal Redesign: GIA Deliksari Web

> Status: **DRAFT untuk approval** · Tanggal: 9 Oktober 2026
> Scope: redesign visual flat-minimalism + dual theme + tokenisasi penuh
> Prasyarat: tidak ada perubahan kode sebelum plan ini disetujui

---

## 1. Diagnosa: Kenapa Tampilan Sekarang Terasa "Aneh"

Analisa sebelumnya menemukan 4 masalah struktural (bukan sekadar "warna salah"):

| # | Masalah | Bukti | Dampak |
|---|---|---|---|
| 1 | **Light mode tidak ada pemisahan permukaan** | canvas `#FFFFFF` = kartu `#FFFFFF`; border `#E5E7EB` = **1.18:1** | Kartu terasa datar, seperti teks tanpa kotak |
| 2 | **Border gagal WCAG 1.4.11** (butuh 3:1) | `#E5E7EB` di putih = 1.24:1 | Kotak form doa praktis tak terlihat |
| 3 | **Dark wine gagal kontras** | `#B8323D` di `#0F1115` = **3.20:1**; di kartu `#171A21` = **2.95:1** | Teks wine di dark mode tak terbaca |
| 4 | **Token system mati total** | `var(--primary)` dipakai **0×**; 3000+ hex hardcode di 40 file | Setiap revisi = find-replace 40 file → selalu bocor |

Tambahan: **Plus Jakarta Sans** (geometric, gaya fintech/SaaS) di `layout.tsx` — penyumbang utama aura "template SaaS", bukan warnanya.

---

## 2. Arah Desain (dari user)

- **Flat, simple, clean, minimalism**
- **Palet enak dilihat** (eye-comfortable, tidak norak)
- **Selaras dengan logo merah** (crimson `#B8322F`, tidak bisa diubah)
- **Dual theme** (light + dark) dengan toggle yang baik
- **Khusus website gereja** — read-heavy (jadwal, warta, roster), audiens 20–70 tahun

---

## 3. Palet Final — "Canonical Flat, Brand-True"

Diturunkan dari logo crimson `#B8322F` (hue 1°). Primary `#8C1F28` (hue 355°) = turunan langsung.

### Light

| Token | Hex | Peran |
|---|---|---|
| `canvas` | `#FFFFFF` | Background halaman |
| `surface` | `#FFFFFF` | Background kartu |
| `sunken` | `#F7F7F8` | Background inset, baris tabel, area kode |
| `border` | `#E3E5E9` | Border dekoratif (1.26:1 — **sengaja tipis**, flat design) |
| `border-strong` | `#8E929B` | Border form/divider bermakna (**3.12:1**, WCAG PASS) |
| `text` | `#16181D` | Teks utama (17.76:1) |
| `text-subtle` | `#5C6169` | Teks sekunder (6.23:1) |
| `wine` | `#8C1F28` | CTA primer, aksen (8.97:1) |
| `wine-hover` | `#741A22` | State hover CTA |
| `wine-text` | `#8C1F28` | Teks/ikon wine |

### Dark

| Token | Hex | Peran |
|---|---|---|
| `canvas` | `#101114` | Background halaman |
| `surface` | `#17191D` | Background kartu (15.85:1 teks) |
| `sunken` | `#1E2126` | Background inset |
| `border` | `#2A2E35` | Border dekoratif |
| `border-strong` | `#5A616C` | Border form (**3.02:1**, PASS) |
| `text` | `#F2F3F5` | Teks utama (17.00:1) |
| `text-subtle` | `#A0A5AE` | Teks sekunder (7.63:1) |
| **`wine`** | **`#A82F38`** | **CTA bg (putih di atasnya = 6.71:1)** |
| `wine-hover` | `#8C1F28` | Hover |
| **`wine-text`** | **`#E8767E`** | **Teks/ikon wine (6.58:1 di canvas)** |

> **Kenapa wine 2-tier di dark?** `#DC5A63` cukup kontras untuk *teks* (5.11:1) tapi putih di atasnya cuma 3.69:1 — gagal untuk *background CTA*. Solusi: `wine` untuk bg, `wine-text` untuk teks. Ini pola standar dark mode.

### Hasil Verifikasi WCAG

```
22/22 PASS — semua pasangan wajib (teks, muted, wine, CTA, border) lolos
Light: teks 17.76:1 · muted 6.23:1 · CTA 8.97:1 · form border 3.12:1
Dark:  teks 17.00:1 · muted 7.63:1 · CTA 6.71:1 · form border 3.02:1
```

---

## 4. Tokenisasi — Prasyarat Redesign

### Layer 1: Primitive (nilai mentah)
```
--gia-white        #FFFFFF      --gia-black        #000000
--gia-crimson      #8C1F28      --gia-crimson-dk   #A82F38
--gia-crimson-tint #E8767E      --gia-crimson-hover #741A22
--gia-grey-50 … --gia-grey-900  (9 step netral)
```

### Layer 2: Semantic (dipakai komponen)
```
--gia-canvas       var(--gia-canvas-l)
--gia-surface      var(--gia-surface-l)
--gia-sunken       var(--gia-sunken-l)
--gia-border       var(--gia-border-l)
--gia-border-strong var(--gia-border-strong-l)
--gia-text         var(--gia-text-l)
--gia-text-subtle  var(--gia-text-subtle-l)
--gia-wine         var(--gia-wine-l)
--gia-wine-hover   var(--gia-wine-hover-l)
--gia-wine-text    var(--gia-wine-text-l)
```
Tiap semantic punya pasangan `-l` (light) dan `-d` (dark), dipilih lewat `prefers-color-scheme` + `data-theme` manual (untuk toggle).

### Layer 3: Tailwind mapping
```ts
colors: {
  canvas: 'var(--gia-canvas)',
  surface: 'var(--gia-surface)',
  sunken: 'var(--gia-sunken)',
  edge: 'var(--gia-border)',
  'edge-strong': 'var(--gia-border-strong)',
  ink: 'var(--gia-text)',
  'ink-subtle': 'var(--gia-text-subtle)',
  wine: 'var(--gia-wine)',
  'wine-hover': 'var(--gia-wine-hover)',
  'wine-text': 'var(--gia-wine-text)',
}
```

### Strategi Migrasi (aman, 4 langkah)

1. **Tambah token** di `globals.css` + `tailwind.config.ts` — belum dipakai apa pun, nol risiko
2. **Migrasi komponen inti** (`Button`, `Card`, `Badge`, `ThemeToggle`) — visible impact terkontrol
3. **Migrasi per halaman** (`Hero` → `Navbar` → `Footer` → section) — satu file satu commit
4. **Bersihkan sisa hex** — hapus yang sudah tidak dipakai, jalankan `lint:design`

> **Aturan**: setiap langkah harus lulus `tsc` + `npm test` + `lint:design` sebelum lanjut.

---

## 5. Flat Design Rules ( enforceable via lint)

| Aturan | Threshold | Alasan |
|---|---|---|
| `shadow-lg/xl/2xl` | **DILARANG** | Terlihat "card lift", bukan flat |
| `shadow-md` | **DILARANG** | Border sudah cukup untuk pisah |
| `shadow-xs/sm` | **BOLEH** hanya untuk sticky header & modal | Butuh lifting context |
| `bg-gradient` | **DILARANG** | Flat = warna solid |
| `blur-3xl` (glow orb) | **DILARANG** | AI-slop pattern |
| `backdrop-blur` | **BOLEH** hanya sticky header | Fungsional |
| `rounded-[2rem]` / `[2.5rem]` | **DILARANG** | Terlalu membulat untuk flat |
| `rounded-2xl` | **BOLEH** | 16px = standar flat |
| `rounded-full` | **BOLEH** hanya untuk badge/pill/avatar | Bentuk semantik |

---

## 6. Tipografi

**Sekarang**: Inter + Plus Jakarta Sans (geometric, aura SaaS)

**Rencana**: ganti display ke serif — rasa "gereja" & "majalah bulanan", bukan "landing page SaaS"

| Kandidat | Heading | Body | Catatan |
|---|---|---|---|
| **Cormorant Garamond** | serif klasik | — | Paling liturgis, tapi body perlu sans |
| **Playfair Display** | serif high-contrast | — | Elegan, tapi kontras tinggi = kurang cocok untuk orang tua |
| **Newsreader** | serif readable | **Inter** (tetap) | Paling aman: editorial +Aa readable |
| **Source Serif 4** | serif | **Inter** | Kuat, tegas, tidak norak |

**Rekomendasi: Newsreader (display) + Inter (body)** — editorial tapi tetap terbaca untuk audiens 60–70 tahun. Plus Jakarta Sans dihapus.

---

## 7. Perbaikan Dual-Theme (bugs yang ditemukan)

| File:line | Bug |
|---|---|
| `Hero.tsx:186` | Kartu logo 128px `bg-white` tanpa `dark:bg-` → putih di dark mode |
| `GivingSection.tsx:297,409` | Kartu QRIS/rekening putih tanpa dark |
| `AdminDashboard.tsx:1868` | Modal `bg-white` + `shadow-2xl` |
| `Button.tsx:35-37` | `variant` default `gold` (slate, bukan wine); `dark:bg-[#C04050]` = hue wine ke-4 yang ada di mana-mana kecuali sistem |
| `globals.css:19,42` | `--accent` masih bernama "gold" padahal sudah slate |

---

## 8. Rencana Eksekusi (7 Fase)

> Diperbarui setelah riset 6 agen (9 Okt 2026). Baseline terukur: **3.601** class hex arbitrary, **5** pemakaian `var(--)`, **47** hex unik.

### Wave 0 — Prasyarat (nol risiko visual, ~30 menit) ⚠️ WAJIB DULU

Tiga bug yang ditemukan riset — **saya sebabkan sendiri di redesign navbar kemarin**:

| # | Bug | Lokasi | Dampak |
|---|---|---|---|
| **0.1** | **ThemeToggle hanya ada di dalam drawer `lg:hidden`** | `Navbar.tsx:231` | **Desktop tidak punya cara ganti tema sama sekali** — konsekuensi langsung dari keputusan "pindahkan tema ke hamburger" |
| **0.2** | **Duplikat script tema** | `layout.tsx:206` (`theme-init`) + `:214` (inline) | Resolusi tema jalan **2×** per load |
| **0.3** | **`mounted` di-set tapi tidak pernah dibaca** | `ThemeProvider.tsx:21` | Akan jadi hydration error saat styling dirapikan |

> Tanpa 0.1, **QA dark mode tidak bisa diverifikasi manual** di desktop.

### Wave 1 — Tulis token (jangan pakai dulu, ~30 menit)

4. Tulis semantic tokens + pasangan light/dark di `globals.css`. **Jangan** rewrite `tailwind.config.ts` — sudah memetakan `primary.DEFAULT: 'var(--primary)'` dengan benar.
5. Tambah `--brand-text`, `--brand-text-hover`, `--border-strong`, `--card-inverted-*`, `--status-*` ke config.
6. **Ganti `#6B7280` → `#5B6472` global** (1 perintah, 303 kemunculan). Memperbaiki 303 kegagalan AA nyata (`4.39:1` di surface secondary) **tanpa mengubah proporsi/layout**.

### Wave 2 — Migrasi hex per-wave (JANGAN 3.601 sekaligus)

Gelombang berdasarkan beban: `AdminDashboard.tsx` 777 → `info/page.tsx` 287 → `KasDashboard.tsx` 215 → `GallerySection.tsx` 108 → `Hero.tsx` 95 → `Navbar.tsx` 74 = **1.556 (42%)** di 6 file.

⚠️ **Jebakan fill-vs-text:** `#8B1E28` muncul 315× sebagai `bg-` (fill) **dan** lewat `dark:text-` sebagai teks. Migrasi **per-prefix**:
```
bg-[#8B1E28]   → bg-[var(--brand)]        (fill)
text-[#8B1E28] → text-[var(--brand-text)] (teks)
```
Global find-replace akan mengubah tombol jadi teks.

⚠️ **Always-dark panel:** **130** `bg-[#171A21]` (AboutSection:69, Card.tsx:25, useToast.tsx:32 + 16 panel). Harus dapat token sendiri (`--card-inverted-*`), **bukan** `--bg-surface` — kalau tidak, panel gelap jadi putih di light mode.

### Wave 3 — Flat pass (setelah warna stabil)

7. `shadow-xs` 68 + `shadow-sm` 55 → ganti `border-subtle`. **Termination**: biarkan `shadow-2xl` untuk modal (10 `backdrop-blur` ikut modal).
8. `rounded-[2rem]` 9 + `[2.5rem]` 3 (11 di `info/page.tsx`) → **review manual**, jangan buta. Flat ≠ nol radius.
9. 5 gradient hero identik → 1 utility class.
10. 6 hex ungu off-brand (`#6D28D9` `#A78BFA` `#FAF5FF` `#E9D5FF` `#4C1D95` `#2E1065`, 46 class) → wine-tint.

### Wave 4 — Bug & off-brand

11. `GallerySection.tsx:364` — teks `#4B5563` di atas overlay `bg-black/90` = **2.37:1 FAIL**. Rest state tak terbaca (hover `#9CA3AF` = 7.06 OK).
12. 4 bug dark mode: `Hero.tsx:186`, `GivingSection.tsx:297,409`, `AdminDashboard.tsx:1868`.
13. `Button.tsx:35-37` — `variant` default `gold` (slate, bukan wine); `dark:bg-[#C04050]` = hue wine ke-4.

### Wave 5 — Tipografi (tergantung keputusan §9.3)

### Wave 6 — DESIGN.md + lint rules + cleanup

14. Update `DESIGN.md` (tokens + aturan flat).
15. Pasang lint rules F1–F10 (§5).
16. Bersihkan hex sisa; `AdminDashboard.tsx` (2.271 baris = 21% beban hex) **wave terakhir**.

**Total**: ~8 jam, 7 commit terpisah (setiap fase rollback-able).

---

## 9. Yang Perlu Diputuskan

1. **Radius target**: `rounded-xl` (12px) atau `rounded-2xl` (16px)? *Rekomendasi: 12px card / 8px control* — kompromi "soft flat" yang tetap terbaca untuk audiens 60–70. Swiss 0px akan terlihat kejam.
2. **Body text**: 16px (status quo) atau 17px? Untuk mobile elderly 17px/1.7 lebih aman, tapi mengubah spec tertulis.
3. **Serif untuk display?** `DESIGN.md:28` bilang serif tapi `tailwind.config.ts:60` tulis `system-ui` — **Georgia tidak pernah tercapai**; ada 3 jalur font berbeda di repo. *Rekomendasi: sans dulu* (CWV +，不想加 webfont di fase ini); serif = Wave 5 terpisah.
4. **Status colors** (emerald/rose/indigo, 501 pemakaian): token `--status-*` terpisah atau dibiarkan? *Rekomendasi: token terpisah* — semantik kas ("dana keluar = merah") harus tetap.

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| **Token dead-code** — 0 dari 12 token terpakai | Wave 1 tulis, Wave 2 pakai. Gate F6 memaksa `var(--)` naik dari 5 |
| **Jebakan fill-vs-text** (`#8B1E28` 315×) | Migrasi per-prefix (`bg-` vs `text-`) |
| **Always-dark panel terbalik** (130 `bg-[#171A21]`) | Token `--card-inverted-*` terpisah |
| **Dark CTA tanpa border** — boundary 2.95:1 | Dark CTA wajib `border: 1px solid var(--border-strong)` → 3.68 ✓ |
| **Border 1.4.11** — semua border lama gagal 3:1 | `--border-strong` untuk form; `border-subtle` hanya dekoratif |
| **FOUC** — 3 jalur resolusi tema | Setelah Wave 0 hapus duplikat → bisa pindah CSS-only `html[data-theme]` |
| **Diff 3.601 class** mustahil direview | Wave 2 per-file, commit per file, lint + Lighthouse tiap commit |
| **Admin bukan surface publik** — risiko tinggi, nilai rendah | Wave terakhir |

