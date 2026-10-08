---
name: GIA Deliksari Web Portal
description: Clean, reverent digital home for the GIA Deliksari congregation.
colors:
  primary: "#8B1E28"
  primary-dark: "#B8323D"
  primary-hover: "#731820"
  gold: "#4B5563"
  gold-dark: "#9CA3AF"
  alabaster: "#FFFFFF"
  cream: "#F3F4F6"
  card: "#FFFFFF"
  ink: "#111827"
  ink-muted: "#6B7280"
  charcoal: "#0F1115"
  slate-card: "#171A21"
  slate-raised: "#1F232D"
  slate-border: "#2A2F3A"
  linen: "#F9FAFB"
  linen-muted: "#9CA3AF"
typography:
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  display:
    fontFamily: "var(--font-display), Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.12
  label:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
rounded:
  control: "0.75rem"
  card: "1rem"
  badge: "9999px"
spacing:
  unit: "0.25rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.badge}"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "#731820"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
  badge-neutral:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.badge}"
---

# Design System: GIA Deliksari Web Portal

## Overview

**Creative North Star: "The Clean Sanctuary"**

GIA Deliksari's web portal should feel like arriving at a familiar church home: calm, welcoming, and grounded in real community life around Sekaran and UNNES. Pure white surfaces and cool neutral greys hold the page; the official crimson identity remains visible, but only where it helps people find an action or recognize a meaningful church detail.

The public pages invite visitors and communicate schedules. The admin, superuser, and treasury portals help church operators finish practical work. Their visual density may differ, but both share the same neutral foundations, legible text, and restrained identity accents.

**Key Characteristics:**
- Pure white canvas and cool neutral greys carry most of the interface. No sepia, cream, or caramel surfaces.
- Sacred wine `#8B1E28` is reserved for primary actions and a few meaningful highlights — the only saturated colour on the page.
- Warm gold is gone; liturgical emphasis uses cool slate `#4B5563` instead, so the palette never drifts toward brown.
- Flat, composed surfaces keep attention on people, schedules, and service information.

## Colors

A cool neutral foundation supports a single intentional church identity accent. Light and dark themes use distinct surface ramps; dark mode is cool slate, not a mechanical inverse, and never a warm brown-black.

### Primary
- **Sacred Wine** (`{colors.primary}`): Primary actions, selected navigation, and a limited set of church identity highlights.
- **Night Wine** (`{colors.primary-dark}`): Primary-action counterpart on dark surfaces.

### Secondary
- **Cool Slate** (`{colors.gold}`): Small liturgical emphasis and schedule cues, replacing the former warm brass. Keep labels readable and verify each foreground/background pair.
- **Mist Slate** (`{colors.gold-dark}`): Slate accent on dark surfaces.

### Neutral
- **Pure White** (`{colors.alabaster}`): Main light-mode canvas.
- **Cool Mist** (`{colors.cream}`): Secondary light surface and neutral badge fill.
- **White Linen** (`{colors.card}`): Light-mode cards and raised content surfaces.
- **Graphite Ink** (`{colors.ink}`): Primary light-mode text.
- **Graphite Muted** (`{colors.ink-muted}`): Secondary light-mode text; verify on each actual surface.
- **Cathedral Charcoal** (`{colors.charcoal}`): Main dark-mode canvas, cool near-black.
- **Slate Card** (`{colors.slate-card}`): Dark cards and popovers.
- **Raised Slate** (`{colors.slate-raised}`): Elevated dark surfaces and controls.
- **Chiseled Edge** (`{colors.slate-border}`): Dark-mode borders and separators.
- **Linen Text** (`{colors.linen}`): Primary dark-mode text.
- **Mineral Text** (`{colors.linen-muted}`): Secondary dark-mode text; verify on each actual surface.

**The Rare Wine Rule.** Sacred wine communicates identity and action. Ordinary categories, information badges, and structural borders remain neutral. Warm, sepia, cream, and caramel tones are not part of this palette — if a surface reads brown, it is wrong.

## Typography

The existing sans and display font variables remain the base system. Print bulletins use a bookish serif face suited to paper and longer reading.

### Hierarchy
- **Display** (bold, fluid up to 3.75rem, line-height 1.12): Public page headlines.
- **Title** (semibold or bold, 1.25–1.875rem): Page and section titles.
- **Body** (regular, 1rem, line-height 1.6): Explanatory text and service details.
- **Label** (bold, 0.75rem): Compact categories, metadata, and control labels.

Body copy should remain comfortably readable; avoid long unbroken measures, and use tabular numerals where schedules, dates, and financial figures need alignment.

## Layout

Public sections use a centered content width up to 80rem with responsive side gutters (`px-4 sm:px-6 lg:px-8`). Content groups are compact internally and separated by generous vertical space. Cards use a purposeful grid only where comparison helps, such as ministry schedules or service methods. Small screens stack those groups without horizontal overflow.

Operator surfaces prioritize task completion and readable data density rather than public-page spaciousness.

## Elevation & Depth

At rest, use tonal surface changes and a subtle border to separate content. Do not combine heavy borders and prominent shadows. Reserve soft shadow for floating controls and dialogs; dark mode uses lighter surface steps rather than shadow glow.

## Shapes

Cards have gently rounded corners (16px). Controls use a smaller, clear radius (12px); pills are reserved for compact labels and controls. Avoid oversized radii on large content panels.

## Components

### Buttons
Primary actions use a solid Sacred Wine fill, white text, and a visible focus ring. Secondary actions use a neutral surface and border. Slate-filled controls use a sufficiently dark foreground; white text on light slate is not an approved pairing. Hover states should be restrained and preserve contrast.

### Chips and badges
Neutral is the default for ordinary categories and metadata. Wine variants are used only where their meaning is specific. Slate variants mark liturgical emphasis. Status color is paired with a readable label and is never the sole carrier of meaning.

### Cards and containers
Content cards use white linen in light mode and slate card in dark mode with a fine neutral border. Category is communicated through headings, compact badges, and explicit labels rather than thick colored edge bars.

### Navigation
Navigation backgrounds follow the active theme. The active route uses clear text weight and one restrained indicator. The header exposes exactly one control on small screens — the menu trigger. Theme and admin entry points live inside the mobile drawer, never as duplicate floating buttons, so no breakpoint can render two of them at once. Mobile navigation remains grouped and discoverable.

### Print bulletin
The `/info/print` route uses an editorial serif face, clear section hierarchy, and print-safe contrast on white paper. Its layout must remain usable as an A4 printout.

## Do's and Don'ts

### Do:
- **Do** keep schedules, service contacts, and giving details factual and consistent with `INFO.md`.
- **Do** verify text, icons, and focus indicators against the surface where they actually render in both themes.
- **Do** reserve gold foreground on filled gold surfaces for dark text.
- **Do** make neutral category and status labels understandable without color.

### Don't:
- **Don't** use wine-red as the default canvas, card, or structural border color.
- **Don't** make an ordinary informational badge look like an error state.
- **Don't** use large decorative crimson gradients, gradient text, or colored glow as filler.
- **Don't** use thick colored top or side bars on rounded cards.
- **Don't** present a stylized placeholder QR pattern as a real scannable payment code; display only a verified production QR asset.
