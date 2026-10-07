# Changelog

All notable changes to GIA Deliksari Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2026-10-07 — Impeccable Integration & Warm Alabaster / Sacred Wine Theme Overhaul

### Design System (replaces the red-saturated "Sacred Crimson" theme)
- **Motivasi**: tema lama terasa "terlalu merah" — kanvas gelap marun `#150B0D`, kartu `#221215`, border `#3A1C20`, dan badge pink `#FDF0F0` membuat seluruh antarmuka terlihat seperti melalui lensa merah, terutama di dark mode.
- **Light mode baru**: Warm Alabaster canvas `#FAF7F2`, kartu putih, border hangat `#E5DFD5`, teks `#1C1917`.
- **Dark mode baru**: Cathedral Slate `#141312` / kartu `#1D1B19` / elevated `#262421` / border `#332F2B` — netral hangat, tanpa lensa merah sama sekali.
- **Aksen terkendali (<=10%)**: Sacred Wine `#8B1E28` (light) & `#B8323D` (dark) khusus CTA primer dan indikator nav aktif; Altar Gold `#8C6826`/`#C49B45` untuk penekanan liturgis.
- **Semantik warna**: bahaya (error, hapus, saldo negatif, pengeluaran) = Tailwind **rose**; pemasukan = **emerald**; kategori komunitas = tone wine/terracotta/gold/plum yang diredam dengan varian dark lengkap.
- **Default badge** berubah dari `maroon` (pink alert) menjadi `neutral` — menghilangkan alert fatigue pada informasi biasa.

### Impeccable Design Framework
- **`PRODUCT.md`** (impeccable product-schema 1) dan **`DESIGN.md`** (frontmatter token normatif) dibuat sebagai single source of truth visual.
- **Design linter**: `npm run lint:design` memanggil CLI Impeccable secara read-only dari clone bersama di `/home/zzdree/ANDREAS/impeccable` (tidak pernah dimutasi — aman untuk sesi lain yang memakai clone yang sama).
- **Anti-pattern remediation**: 20 → **0** anti-pattern (`side-tab`, `border-accent-on-rounded`, `gradient-text`, `bounce-easing`, kartu radius 40px).
- `PRODUCT.md` / `.claude/skills/impeccable` symlink / `AGENTS.md` / `CLAUDE.md` ikut ter-version; symlink di-gitignore karena path absolut.

### Bug fixes & cleanup
- **SermonsSection** tidak lagi mengunci dark mode di light mode — mengikuti tema aktif; glow merah dekoratif dihapus.
- **Semantik uang /kas**: kartu Total Pemasukan (tadinya latar pink) → emerald; Total Pengeluaran → rose; badge transaksi Pengeluaran → rose; tombol "Catat Pengeluaran" → solid rose.
- **Nomor rekening bank** (BCA/BRI) di `/persembahan` menjadi arang netral, bukan merah (menghindari kesan "defisit").
- Tombol hapus (Trash2) dan 7 event audit destruktif dipastikan rose (bukan wine).
- Radius kartu `2.5rem`/`2rem` → `rounded-2xl` (16px); tombol gradien → solid; blob `blur-3xl` merah dihapus; warna manifest & OG image menyesuaikan palet baru.

### Verified
- `npm run lint:design` → 0 anti-patterns; `npm test` → 26/26; `npm run typecheck` → 0 error; `npm run build:cf` → OK.
- Live di `https://giadeliksari.my.id` (worker version `db7ea3ce`), seluruh rute publik HTTP 200 dengan token palet baru terkonfirmasi di HTML/CSS produksi.
- **Catatan**: verifikasi visual browser (screenshot light/dark/mobile) belum dijalankan — Playwright mencari Chrome di `/opt/google/chrome` yang tidak ada di mesin dev.

## [2.2.0] - 2026-10-07 — Clean Brand Logo, Image Purge, Template States & Full INFO.md Integration

### Logo & Clean Asset Pipeline
- **Clean Solid Brand Logo**: Injected official GIA Deliksari crimson logo (`#B8322F`) processed from `giad_logo.jpg` at 1080x1080 resolution, compiled into `logo.png`, `logo.jpg`, `logo.webp`, and `logo.avif`.
- **Image Purge**: Safely archived non-matching, legacy placeholder images from `public/images/` to `backups/old-images-backup/`. Kept only official logo assets; YouTube sermon thumbnails now safely fallback to `/images/logo.png`.
- **Clean Templated UI**: Replaced raw photographic placeholders across `/home` with elegant, branded UI templates:
  - `Hero.tsx`: Branded card with official church logo, glowing badge, and Sekaran UNNES address.
  - `AboutSection.tsx`: Pastoral team leader cards with authentic initials/monogram cards, icon identifiers, and official social media deep links.
  - `MinistriesSection.tsx`: 4 community cards with branded liturgical gradients, community icons, and schedule chips.
  - `GallerySection.tsx`: Clean empty state template ("Arsip Foto Sedang Dipersiapkan") pointing to YouTube sermons and Google Drive master.

### 100% INFO.md Integration
- **Rendered Struktur Organisasi Pelayanan (`OrganizationSection.tsx`)**: Mounted church leadership structure directly on `/home` (Section `#struktur`) and linked from Navbar:
  - Youth / Grow Generation (Ketua: Sdri. Lara, Sekretaris: Sdr. Ravael, Bendahara: Sdri. Mara, Sie. Liturgi, Komsel, Akomodasi).
  - 5 Kelompok Sel Komsel (Ekklesia Sel, Amethyst, Daughter of Grace, Nazareth, Domba Perjuangan beserta ketua masing-masing).
  - Sekolah Minggu COC Kidz / KAA (Ketua: Sdri. Yemima Purnamasari, Sekretaris: Sdri. Kesya, Bendahara: Ibu Septi).
  - Wanita HANA (Ketua: Ibu Penskilla, Sekretaris: Ibu Siska, Bendahara: Ibu Sulistya).
- **Comprehensive Church Schedule & Weekly Agenda (`src/app/info/page.tsx`)**: Added dedicated Section `#agenda` to `/info`:
  - 4 Pilar Ibadah Utama (Ibadah Raya, Grow Youth, COC Kidz, Wanita HANA).
  - Ibadah Doa Pagi (Selasa–Jumat 05.00–05.30 WIB di Gedung Utama + tombol langsung Join Zoom).
  - Latihan Musik Umum (Sabtu 10.00–12.00 & 20.00–22.00 WIB).
  - Jam Kerja Kantor Gereja (Selasa–Sabtu 08.00–15.00 WIB di Ruang Gembala).
  - Detail 3 Kotak Persembahan Fisik di Lobi Gereja (Kotak 1 & 2 Umum, Kotak Khusus Pembangunan/Diakonia).

### Bugfixes & Security Hardening (P0 & P1)
- **Real D1 Deletion**: Implemented `deleteViaApi` on `storage.ts` and connected all 6 delete handlers in `AdminDashboard.tsx` to D1 `DELETE /api/admin/data`.
- **Admin Login Fix**: Corrected role verification to check user roles array, resolving false "Akses ditolak" errors.
- **SQL Column Whitelist**: Hardened `POST /api/admin/data` with `TABLE_COLUMNS` schema whitelisting.
- **Protected Gallery Upload**: Added `requireRole` check on `/api/gallery/upload` and removed destructive auto-prune.
- **YouTube API 100x Quota Reduction**: Switched to `playlistItems.list` with D1 database fallback.
- **Dedicated Bulletin Print Route (`/info/print`)**: A4 portrait layout immune to mobile popup blockers.
- **Eliminated ThemeProvider FOIT**: Removed invisible wrapper, injected inline script in `<head>`.
- **Fixed Service Worker Precache**: Removed 404 favicon, fixed API GET matching.

---

## [2.1.0] - 2026-10-01 — Custom Domain giadeliksari.my.id & CI/CD Hardening

### Custom Domain & Edge Routing
- **Official Domain Attached**: Connected `giadeliksari.my.id` and `www.giadeliksari.my.id` to Cloudflare Workers via Cloudflare Zone `b5955189f916b4dc8582cd07635d21b3` with nameservers delegated from IDwebhost (`kallie.ns.cloudflare.com` & `merlin.ns.cloudflare.com`).
- **Universal SSL**: Deployed active Universal SSL with Full encryption and Always Use HTTPS.
- **Canonical URLs**: Updated `layout.tsx`, `sitemap.ts`, `robots.ts`, and `wrangler.jsonc` default canonical URLs to `https://giadeliksari.my.id`.
- **Dual Routing**: Kept `workers_dev: true` so `gia-deliksari-web.zzdree.workers.dev` remains available as edge fallback.

### CI/CD & Testing Hardening
- **Node 22 Upgrade**: Upgraded GitHub Actions runner in `ci.yml` and `lighthouse.yml` from Node 20 to Node 22, resolving `undici` / `jsdom` `markAsUncloneable` errors during Vitest execution.
- **Security Audit Fix**: Resolved all CVE advisories (`next` v16.3.8, `undici`, `brace-expansion`, `qs`), bringing `npm audit --audit-level=high` to 0 vulnerabilities.
- **Lighthouse CI Configuration**: Added `.lighthouserc.json` with targeted category score assertions for desktop audits against production, and verified automated run succeeds (100% green).
- **Playwright Smoke Integration**: Updated smoke and mutation tests to target `https://giadeliksari.my.id`.

---

## [2.0.0] - 2026-10-01 — Cloudflare Native & Modular Architecture Overhaul

### Cloudflare Migration
- **Backend Migration**: Replaced Supabase and Vercel with **Cloudflare D1 (Serverless SQLite)** + **OpenNext Edge Runtime** (`@opennextjs/cloudflare`) deployed on Cloudflare Workers.
- **Database Engine**: 9 tables + 1 view ported to SQLite with full parameter-binding prepared statements in `src/lib/d1.ts`. Zero downtime, 24/7 always active edge database in Singapore region (APAC - SIN).
- **Cleanup & Purge**: 100% purged all legacy Supabase directories (`supabase/`), 11 deprecated scripts in `scripts/`, `vercel.json`, and deployment logs.
- **Worker Cron Triggers**: Restored auto-sync cron (`0 3 * * *`) via Cloudflare Workers native cron triggers.
- **Production Secrets**: Secured production secrets (`ADMIN_SESSION_SECRET`, `YOUTUBE_API_KEY`, Google OAuth tokens) encrypted via Wrangler Secret API.

### Modular Page & UX Architecture (Anti-Slop Redesign)
- **Eliminated 12.000px Endless Scroll on `/home`**: Streamlined home page from 12 bloated sections down to 5 focused sections (Hero, Hospitality, About & Gembala, 4 Pilar, Lokasi & Kontak). HTML payload reduced ~45%.
- **Zero Hallucination / Fact-Checked Content**: Purged artificial history dates; grounded all content strictly in verified church data (Kawasan Sekaran, UNNES, Sanctuary & Bethel facilities, pastoral leadership).
- **New Modular Routes**:
  - `/layanan` — Dedicated portal for prayer requests, pastoral counseling, sacrament registrations, and volunteer sign-ups with auto-normalized Indonesian WhatsApp formatting (`08xx` -> `628xx`).
  - `/media` — Dedicated hub for latest YouTube sermon archives and photo gallery with interactive lightbox.
  - `/persembahan` — Dedicated giving experience with 4 category tabs, 1-click BCA/BRI account copying, high-res QRIS modal dialog, and dynamic WhatsApp confirmation generator.
- **Navbar & Footer Refactor**: Desktop navigation and mobile drawer updated to 5 clear modular items with active route highlighting and scroll progress bar.
- **Roster WA Broadcast Generator**: Added 1-click WhatsApp broadcast formatting with Scripture quote (`1 Petrus 4:10`) in `ScheduleSection` and `/info`.

---

## [1.1.0] - 2026-09-01

### Added
- **UI primitives library** (`src/components/ui/`): Button, Badge, Card, LinkCard, Skeleton, EmptyState, Container primitives. Hybrid approach — added alongside existing components without breaking visual continuity.
- **`lib/cn.ts`** — Lightweight class joiner utility (clsx-style).
- **`components/ErrorBoundary.tsx`** — Client-side error boundary with branded fallback UI. Logs caught errors via `console.error` and emits custom event `gia:error` for future observability hook.
- **Button primitive** with 4 variants (gold/maroon/outline/ghost) × 3 sizes (sm/md/lg), full loading + disabled + focus + active state coverage, polymorphic (link | button | external link).
- **Hero section refactor**: CTA buttons now use `Button` primitive while (preserving original Sacred Crimson styling).
- **ErrorBoundary** integrated in `src/app/layout.tsx` wrapping all children.

### Tests
- **Button** (13 cases): variants, sizes, loading, disabled, onClick, link rendering, fullWidth, focus ring.
- **Badge** (8 cases): 7 variants, iconLeft, custom className.
- **ErrorBoundary** (5 cases): healthy child render, fallback on throw, dev-mode error display, reset interaction, home link fallback.

### CI / Workflows
- **`lighthouse.yml`** — Lighthouse CI audit on every push to main. Asserts Performance ≥ 0.9, A11y ≥ 0.95, Best Practices ≥ 0.95, SEO ≥ 0.9. Core Web Vitals: LCP ≤ 4s, CLS ≤ 0.1, TBT ≤ 300ms. Uploads report as 14-day artifact.

### Security
- **Removed bcrypt hash prefix from logs** (`auth.ts:225`). Previously logged 7-char hash prefix to Vercel function logs; now only logs a generic mismatch warning.

### Documentation
- **CHANGELOG.md** — This file, retroactively tracks notable changes.

---

## Earlier History

See git commit history for the full audit trail. Highlights from past weeks:

### 2026-08-23 → 2026-08-31 — Security hardening week
- **Multi-role bcrypt auth** with HMAC-SHA256 signed cookies
- **Rate limiting**: 3 failed attempts per (IP + username) per 5 min → 1 minute lockout
- **Append-only audit log** for sensitive admin/super/kas actions
- **RLS lockdown** migration dropping anon write policies on CMS tables
- **Daily Supabase backup** to GitHub via GH Action (30-day retention)
- **Backblaze B2 mirror** script for disaster recovery
- **Refactored `/super`** from 1019-line monolith into 4 focused components
- **Code-splitting** for `/admin` and `/kas` via `next/dynamic ssr:false`
- **Vercel Cron** auto-sync gallery Drive → DB at 03:00 UTC daily
- **Vitest + RTL** unit tests for super portal components
- **Playwright** e2e smoke (production) + gated mutation suite
- **TypeScript strict** mode enabled