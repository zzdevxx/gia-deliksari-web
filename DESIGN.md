# Design System & Token Specification — GIA Deliksari Web Portal
**Versi:** 3.4.0 (Multi-Portal Edition)
**Status:** Production Ready
**Tanggal Diperbarui:** 31 Agustus 2026
**Identitas Brand:** Gereja Isa Almasih (GIA) Deliksari Semarang — *"Growing Church!"*

---

## 1. Core Color Palette Tokens

### 1.1 Light Mode (Warm Church Cream & Sacred Crimson)
- **Background Primary**: `#FDFBF7` (Warm Cream Church Paper)
- **Background Secondary / Surface**: `#F7F2E8` (Muted Warm Cream)
- **Surface Card**: `#FFFFFF`
- **Border Default**: `#EBDDCF` / `#E5D3C1`
- **Text Primary**: `#1F1617` (Deep Warm Charcoal)
- **Text Secondary / Muted**: `#5A4D4E` / `#6E5D5F`
- **Primary Accent / CTA**: `#C5222E` (Sacred Crimson Red)
- **Primary Accent Gradient**: `linear-gradient(to right, #C5222E, #80141C)`
- **Gold Accent**: `#C59B27` / `#B87A14`
- **Success / Income**: `#16A34A` (Emerald)
- **Danger / Expense**: `#9A1620` (Maroon)

### 1.2 Dark Mode (Deep Velvet Maroon & Sacred Crimson)
- **Background Primary**: `#150B0D` (Deep Velvet Maroon)
- **Background Secondary / Surface**: `#221215` (Deep Velvet Surface)
- **Surface Elevated / Input**: `#2A161A`
- **Border Default**: `#3A1C20` / `#521E25`
- **Text Primary**: `#F5EFEB` (Warm White)
- **Text Secondary / Muted**: `#D5C2C4` / `#B5A1A3`
- **Primary Accent / CTA**: `#C5222E` (Sacred Crimson Red)
- **Glow Highlights**: `#C5222E/15` blur-3xl

---

## 2. Ministry Community Tokens & Badge Classes

| Kategori Komunitas | Light Badge Classes | Dark Badge Classes | Accent Color |
|---|---|---|---|
| **Ibadah Raya** | `bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0]` | `dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]` | Sacred Crimson (`#C5222E`) |
| **Grow Generation Youth** | `bg-[#FFF2EE] text-[#C83E20] border-[#FCD2C7]` | `dark:bg-[#331812] dark:text-[#F88B72] dark:border-[#57241A]` | Terracotta Orange (`#C83E20`) |
| **COC Kidz (Sekolah Minggu)** | `bg-[#FEF9EC] text-[#B87A14] border-[#F8E3B5]` | `dark:bg-[#332612] dark:text-[#F0BE5E] dark:border-[#543E19]` | Warm Gold (`#B87A14`) |
| **Wanita Hana & Komsel** | `bg-[#FDF0F4] text-[#A6264A] border-[#F7C6D5]` | `dark:bg-[#33121E] dark:text-[#EA7FA0] dark:border-[#541D30]` | Dusty Rose (`#A6264A`) |
| **Superuser (Portal Akses)** | `bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0]` | `dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]` | Sacred Crimson — semua akses |
| **Admin / Operator** | `bg-[#FFF2EE] text-[#C83E20] border-[#FCD2C7]` | `dark:bg-[#331812] dark:text-[#F88B72] dark:border-[#57241A]` | Terracotta — warta/roster/inventaris |
| **Bendahara Youth (Kas)** | `bg-[#FEF9EC] text-[#B87A14] border-[#F8E3B5]` | `dark:bg-[#332612] dark:text-[#F0BE5E] dark:border-[#543E19]` | Warm Gold — kas youth |

---

## 3. Portal Role Visual Identity

Setiap portal punya signature color untuk identitas cepat:

| Portal | Signature Element | Color |
|---|---|---|
| `/home` (publik) | Hero gradient + accent button | Sacred Crimson |
| `/info` (publik operasional) | Section header + countdown pill | Sacred Crimson |
| `/admin` (operator) | Top bar badge + tab active state | Terracotta Orange |
| `/super` (superuser) | Login screen icon + user badge | Sacred Crimson (elevated) |
| `/kas` (bendahara) | Top bar badge + balance card | Warm Gold |

---

## 4. Typography & Geometry Standard

- **Headings**: `font-extrabold tracking-tight` (Google Fonts Inter / Plus Jakarta Sans)
- **Cards & Section Containers**: `rounded-[2.5rem]` or `rounded-[2rem]`
- **Inputs & & Selects**: `px-4 py-3.5 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20]`
- **Buttons**: `rounded-2xl font-extrabold` dengan gradient `#C5222E` ke `#80141C`.
- **Modals**: `rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-2xl p-6 sm:p-8 max-w-lg`

---

## 5. UI Component Specifications

### 5.1 Login Screen (umum untuk /admin, /super, /kas)
- **Container**: `w-full max-w-md bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] rounded-[2.5rem] shadow-xl p-8 sm:p-10 relative z-10 space-y-6`
- **Icon header**: `w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#C5222E] to-[#80141C] text-white flex items-center justify-center mx-auto shadow-lg shadow-red-900/20`
- **Input fields**: `px-4 py-3.5 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-sm focus:ring-2 focus:ring-[#C5222E]/30 focus:border-[#C5222E]`
- **Submit button**: `w-full py-4 rounded-2xl bg-gradient-to-r from-[#C5222E] to-[#80141C]`
- **Error toast**: `p-4 rounded-2xl bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C]`

### 5.2 Top Header Bar (umum untuk portal admin)
- **Container**: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm`
- **Role badge**: `px-3 py-1 rounded-full text-xs font-bold` sesuai role color
- **Action buttons** (refresh, lihat website, logout): `p-3 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] text-xs font-bold`

### 5.3 Tab Navigation (di /admin)
- **Container**: `grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 p-2 bg-[#F7F2E8] dark:bg-[#221215] rounded-3xl border border-[#EBDDCF] dark:border-[#3A1C20]`
- **Active tab**: `bg-gradient-to-r from-[#C5222E] to-[#80141C] text-white shadow-md`
- **Inactive tab**: `text-[#5A4D4E] dark:text-[#D5C2C4] hover:bg-white/60`
- **Count badge**: `px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBDDCF] dark:bg-[#3A1C20]`

### 5.4 Balance Cards (di /kas)
- **Income card**: `p-6 rounded-[2rem] bg-gradient-to-br from-[#FDF0F0] to-[#FFF2EE] dark:from-[#331418] dark:to-[#331812] border border-[#F5CDD0] dark:border-[#521E25]`
- **Expense card**: `p-6 rounded-[2rem] bg-gradient-to-br from-[#FEF9EC] to-[#FDF0F4] dark:from-[#332612] dark:to-[#33121E] border border-[#F8E3B5] dark:border-[#543E19]`
- **Balance card (positive)**: `bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 border-emerald-200`
- **Balance card (negative)**: `bg-gradient-to-br from-[#FDF0F0] to-[#FBE2E4] dark:from-[#331418] dark:to-[#451B21] border-[#F5CDD0]`
- **Amount display**: `text-3xl font-extrabold font-mono`

### 5.5 Transaction Type Badges (di /kas)
- **Income badge**: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200`
- **Expense badge**: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF0F0] text-[#9A1620] border border-[#F5CDD0]`

### 5.6 User Table (di /super)
- **Active status badge**: `bg-emerald-50 text-emerald-700 border-emerald-200` + `<Power />` icon
- **Inactive status badge**: `bg-stone-100 text-stone-600 border-stone-200`
- **Role pill**: `px-2.5 py-0.5 rounded-full text-xs font-bold border` (warna sesuai §2)

### 5.7 Modal / Dialog (umum)
- **Backdrop**: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in`
- **Container**: `w-full max-w-lg bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto`
- **Header**: `flex items-center justify-between` dengan close button `<X />`

### 5.8 Toast Notification (umum untuk /admin, /super, /kas)
- **Container**: `fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#150B0D] text-white border border-[#3A1C20] shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5`
- **Icon**: `<CheckCircle2 className="w-5 h-5 text-emerald-400" />`

### 5.9 Data Tables (umum)
- **Container**: `overflow-x-auto rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm`
- **Header**: `bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] border-b border-[#EBDDCF]`
- **Row hover**: `hover:bg-[#FDFBF7] dark:hover:bg-[#261317]`
- **Row divider**: `divide-y divide-[#EBDDCF] dark:divide-[#3A1C20]`

### 5.10 Countdown Pill (untuk warta upcoming)
- **Container**: `inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FEF9EC] dark:bg-[#332612] text-[#B87A14] dark:text-[#F0BE5E] text-[11px] font-bold border border-[#F8E3B5] dark:border-[#543E19]`
- **Icon**: `<Hourglass />`

### 5.11 Filter Chips
- **Container**: `flex items-center gap-1 bg-[#F7F2E8] dark:bg-[#221215] p-1 rounded-xl border border-[#EBDDCF] dark:border-[#3A1C20]`
- **Active chip**: `bg-white dark:bg-[#2A161A] text-[#1F1617] dark:text-white shadow-xs`
- **Inactive chip**: `text-[#6E5D5F] dark:text-[#B5A1A3] hover:text-[#1F1617]`

### 5.12 Search Input
- **Container**: `relative w-full`
- **Icon**: `<Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />`
- **Field**: `w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs outline-none focus:ring-2 focus:ring-[#C5222E]/30`

### 5.13 Empty State
- **Container**: `p-12 text-center rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] space-y-3`
- **Icon**: `w-10 h-10 text-[accent] mx-auto opacity-60`

---

## 6. Animation Tokens

- **Modal fade-in**: `animate-in fade-in`
- **Modal zoom-in**: `animate-in fade-in zoom-in-95 duration-300`
- **Toast slide-in**: `animate-in slide-in-from-bottom-5 duration-300`
- **Shake on error**: `animate-shake` (form auth errors)
- **Spin (loading)**: `animate-spin` (refresh buttons)

---

## 7. Print-Friendly Layout (opsional, untuk cetak bulletin A4)

`window.print()` cleanup:
- Hide Navbar, Footer, tombol aksi
- Width A4 portrait
- Single column, font-size 11pt
- B/W friendly (remove gradient backgrounds)

---

## 8. Catatan Pemeliharaan

1. **Dark mode** harus selalu paralel dengan light mode — setiap komponen publik punya varian `dark:` Tailwind.
2. **Color contrast** dijaga minimal AA (4.5:1 untuk teks) — verifikasi dengan browser dev tools.
3. **Mobile-first** — semua layout responsive, breakpoint default Tailwind (`sm:`, `md:`, `lg:`, `xl:`).
4. **Icon** dari `lucide-react` saja (konsisten). Custom icon (WhatsApp/Instagram/YouTube) di `src/components/Icons.tsx`.
5. **Animation budget** — hindari animasi berat (parallax, large image scale on scroll). Cukup fade + slide.

---

_Phase 1 (CMS): selesai_
_Phase 2 (Multi-role auth + super portal): selesai_
_Phase 3 (/admin pakai multi-user auth): selesai_
_Phase 4 (/kas + treasury): selesai_
_Phase 5 (/info page): selesai_
_Phase 6 (Cleanup placeholder & Zoom link): selesai_
_Phase 7 (PRD/DESIGN.md sync dengan multi-portal): selesai_

_Dokumen ini terakhir diperbarui: **31 Agustus 2026**._