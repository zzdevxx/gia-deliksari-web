---
name: GIA Deliksari Web Portal
description: Flat, calm, reverent digital home for the GIA Deliksari congregation.
# ─────────────────────────────────────────────────────────────────────────────
# The frontmatter below is a MACHINE CONTRACT, not documentation.
# `npm run lint:design` (impeccable detect) parses ONLY this YAML — it reads
# exactly four keys: `colors`, `typography`, `rounded`, and per-role
# `fontSize`. Prose further down the file changes nothing.
#
# Adding a hex or a font size to a component means adding it HERE first.
# That inversion is the point: the palette is reviewable in one place.
#
# Two rules that follow from how the detector matches:
#   • colors match per-channel within ±6/255, so near-duplicates are accepted
#     deliberately rather than by accident.
#   • `var(--token)` values are unconditionally allowed — which is why every
#     colour in `src/` is a token reference and none is a literal.
# ─────────────────────────────────────────────────────────────────────────────
colors:
  # ── brand (the only saturated colour in the product) ────────────────────
  wine: "#8E1533"             # --brand       CTA fill; white on it = 9.11:1
  wine-hover: "#6B1029"       # --brand-hover                 white = 12.13:1
  wine-text: "#F08AA4"        # --brand-text      brand AS TEXT on dark  = 8.35:1
  wine-text-hover: "#FFA8BE"  # --brand-text-hover
  wine-text-on-brand: "#F5A0B6" # --brand-text-on-brand, ON a brand fill = 4.59:1
  wine-tint: "#FAF0F3"        # --brand-tint         light tinted panel
  wine-tint-ink: "#261517"    # --brand-tint-ink     ink on a light tint
  wine-tint-dark: "#401A20"   # --brand-tint         dark tinted panel
  wine-tint-border: "#E3B4C1" # --brand-tint-border  light tint outline
  wine-tint-border-dark: "#7A2839"
  # ── Crimson Field gradient stops (dark) ─────────────────────────────────
  # Hue is 14.1deg, NOT the logo's 21.4deg. That 7-degree shift is the whole
  # trick: at 21deg the gradient passes through mud, at 14deg it stays red.
  field-deep: "#8E1533"       # L=0.422 C=0.154  white text = 9.11:1
  field-mid: "#5A0F24"        # L=0.312 C=0.107  white text = 13.74:1
  field-low: "#26090F"        # L=0.192 C=0.049  white text = 18.61:1
  field-base: "#0A0A0E"       # L=0.147 C=0.009 — achromatic
  # ── light surface ramp ───────────────────────────────────────────────────
  canvas: "#FAF9F8"           # --background   warm neutral, not pure white
  card: "#FFFFFF"             # --card
  surface: "#F1EFEE"          # --surface-raised   inset: table rows, chips
  surface-hover: "#E7E4E2"    # --surface-raised-hover
  border-light: "#E3DFDD"     # --border           decorative hairline
  # ── dark surface ramp ────────────────────────────────────────────────────
  canvas-dark: "#0A0A0E"      # --background
  card-dark: "#1B1B24"        # --card              1.16:1 off canvas
  surface-raised-dark: "#24242F"
  surface-raised-hover-dark: "#2E2E3B"
  border-dark: "#31313E"      # --border
  inverted-dark: "#17171E"    # --card-inverted-bg (light-mode dark panels)
  # ── frosted glass chrome (functional overlay, Anti-Slop R-10 compliant) ─
  nav-bg-light: "rgba(250, 249, 248, 0.72)"   # --nav-bg
  nav-border-light: "rgba(227, 223, 221, 0.60)" # --nav-border
  nav-bg-dark: "rgba(10, 10, 14, 0.72)"       # --nav-bg
  nav-border-dark: "rgba(49, 49, 62, 0.60)"   # --nav-border
  # ── ink ──────────────────────────────────────────────────────────────────
  ink: "#17161A"              # --foreground       light primary text
  ink-muted: "#5C5654"        # --muted-foreground light secondary
  ink-strong: "#3A3532"       # --ink-strong       light subheading
  ink-strong-hover: "#4B4441"  # hover state of the neutral Button fill
  ink-dark: "#F5F5F7"         # --foreground       dark primary text
  ink-muted-dark: "#A5A5B2"   # --muted-foreground dark secondary     = 8.12:1
  ink-strong-dark: "#D8D8E2"
  ink-on-wine: "#FFFFFF"      # text that sits ON a brand fill
  # ── non-text boundaries (WCAG 1.4.11 needs ≥3:1) ─────────────────────────
  boundary-light: "#8C8683"   # --border-strong   form fields, secondary btn
  boundary-dark: "#73738A"    # --border-strong                        = 4.28:1
  inverted-border: "#4A4A58"  # --card-inverted-border
  inverted-border-dark: "#50505F"
  # ── status (semantic: "dana keluar = merah" must survive) ───────────────
  success: "#166534"
  success-tint: "#F0FDF4"
  success-border: "#BBF7D0"
  success-dark: "#4ADE80"
  success-tint-dark: "#142A1B"
  success-border-dark: "#052E16"
  danger: "#C4362C"           # was #991B1B — only 1.09:1 from --brand
  danger-dark: "#F97066"
  info: "#1D4ED8"
  info-dark: "#8FB8F0"
  # ── warning (pending / attention) ────────────────────────────────────────
  # Amber is the one hue outside the wine ramp, and it is admitted ONLY in this
  # role: a pending/attention status. It is never a fill for a neutral control
  # (ScrollToTop used to be amber; it is brand now). Tailwind's amber-50/800
  # pairs below are the light surfaces these tokens stand for.
  warning: "#991B1B"
  warning-tint: "#FFFBEB"
  warning-border: "#FDE68A"
  warning-dark: "#FCD34D"
  warning-tint-dark: "#2A1F05"
typography:
  # `scale` is the canonical set of permitted steps. `impeccable detect`
  # allow-lists exactly these px values (±0.5). Anything else in a component
  # is a finding.
  #
  # The sub-12px steps are deliberate and audited: the congregation skews
  # 60–70, and every 8–11px usage in this repo is a fixed-format badge
  # (date, count, category chip) that never carries running prose. Anything
  # a person reads in a sentence is ≥12px.
  scale:
    micro: "0.5rem"     # 8px  — superscript mark, "1/3" pager fraction
    nano: "0.5625rem"   # 9px  — dot-matrix tally
    badge: "0.625rem"   # 10px — category chip, date stamp, stat caption
    caption: "0.6875rem" # 11px — metadata under a heading
    label: "0.75rem"    # 12px — control labels (the floor for any real text)
    fine: "0.8125rem"   # 13px — dense table cells
    small: "0.875rem"   # 14px
    base: "1rem"        # 16px — body copy
    section: "1.125rem" # 18px — sub-heading
    title: "1.375rem"   # 22px
    display-sm: "1.625rem" # 26px
    title-lg: "1.875rem"   # 30px
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
  # 4px/6px exist only for the print bulletin's inline pills and chips, which
  # must stay visually distinct from the 16px cards printed around them.
  # No screen component uses them.
  chip: "0.25rem"          # 4px  — print bulletin inline chip
  chip-lg: "0.375rem"      # 6px  — print bulletin inline block
  control: "0.5rem"      # 8px  — inputs, small chips
  control-lg: "0.75rem"   # 12px — buttons, inner cards
  card: "1rem"            # 16px — content cards
  panel: "1.5rem"         # 24px — feature panels (rounded-3xl)
  badge: "9999px"        # pills, avatars, status dots
  # `full` is what the detector matches on to grant the pill exemption —
  # without a key by that name, `rounded-full` needs 9999px listed outright.
  full: "9999px"
spacing:
  unit: "0.25rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.ink-on-wine}"
    rounded: "{rounded.control-lg}"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.wine-hover}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control-lg}"
  card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.card}"
  badge-neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.badge}"
---

# Design System: GIA Deliksari Web Portal

## Overview

**Creative North Star: "The Clean Sanctuary"**

GIA Deliksari's portal should feel like arriving at a familiar church home:
calm, welcoming, grounded in real community life around Sekaran and UNNES.
White surfaces and cool neutral greys hold the page. The official crimson
identity stays visible, but only where it helps someone find an action or
recognise a meaningful detail.

The system is **flat**: hierarchy comes from space, weight, and hairline
borders, never from drop shadows or gradients. This is a deliberate
constraint, not a stylistic accident — see §Flat Rules, which is the part
of this document most worth enforcing.

**Key characteristics**
- White canvas, cool neutral greys. No sepia, cream, or caramel.
- Sacred wine is the only saturated colour, and it is rationed.
- Two themes (light + dark), both hand-tuned — not an algorithmic inverse.
- Elevation is expressed with a 1px border and a surface step, not a shadow.

## Flat Rules

Enforced by review today, by `lint:design` for everything it can see.

| Rule | Status | Why |
|---|---|---|
| `shadow-lg` / `xl` / `2xl` | **banned** | Reads as "card lift" — the single loudest tell of a template-driven UI |
| `shadow-md` | **banned** | A hairline border already separates the surface |
| `shadow-xs` / `shadow-sm` | sticky header, modals only | These need to sit above content; without them they lose the layering |
| `bg-gradient-*` | **banned** in components | Flat = solid fill |
| gradients | image/video scrims, skeleton shimmer, error icon | Legibility surfaces, not decoration. A photo caption needs a scrim to be readable |
| `blur-3xl` glow orbs | **banned** | At 4% opacity a blurred orb reads as a smudge, not depth |
| `backdrop-blur` | sticky header, modal scrims | Functional (frosted chrome) |
| `rounded-[2rem]` and larger | **banned** | Too soft to read as flat. One survives, in the gallery lightbox — a scrim, not a card |
| `rounded-full` | badges, pills, avatars, dots only | A shape carrying meaning |

Shadow is not absent; it is rationed. The only legitimate use is lifting an
element *out of* the page's plane — a sticky header, an open dialog.

## Colors

A cool neutral foundation carrying one intentional identity accent. Every
token has a light and a dark value defined in `globals.css`; a theme switch
needs no per-component edits.

### The two-wine rule

One hex cannot be both a button fill and body text. Measured:

| Role | Light | Dark |
|---|---|---|
| `--brand` — CTA **fill**, white text on top | `#8B1E28` → 9.07:1 | `#B8323D` → 5.90:1 |
| `--brand-text` — brand as **text/icon** | `#8B1E28` → 8.85:1 | `#E88086` → 7.08:1 |

So dark mode necessarily carries two wine tokens. They are not
inconsistency — they are the same brand measured against two canvases. The
light value (8.85:1) passes as text but the dark value (3.20:1 against the
canvas) does not, which is exactly why `--brand-text` exists.

Hue is deliberately preserved across themes: in OKLCH the wine moves only
5.5° (15.9° → 21.4°); only lightness moves (42% → 53% → 72%). The colour
you see in dark mode is the same colour, lit differently.

### Surfaces

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `#FAF9F8` | `#0A0A0E` | page canvas |
| `--card` | `#FFFFFF` | `#1B1B24` | cards, popovers |
| `--surface-raised` | `#F1EFEE` | `#24242F` | inset: table rows, chips |
| `--card-inverted-*` | `#17171E` | `#24242F` | always-dark panels (vision banner, toasts) |
| `--nav-bg` | `rgba(250, 249, 248, 0.72)` | `rgba(10, 10, 14, 0.72)` | frosted glass navbar veil |
| `--nav-border` | `rgba(227, 223, 221, 0.60)` | `rgba(49, 49, 62, 0.60)` | hairline bottom boundary |

`--card-inverted-*` exists because ~130 call sites paint a permanently dark
panel. Pointing them at `--card` would turn those white in light mode.

### Ink

Three steps, not two. `--muted-foreground` is the workhorse secondary.
`--ink-strong` is the darkest neutral that still clears 4.5:1 on the white
canvas (7.03:1) — the one exception a subheading may take without promoting
itself to a heading. Anything lighter belongs to `--muted-foreground`.

`--border` (`#E5E7EB`) measures 1.24:1 and is **intentionally decorative**.
Interactive boundaries use `--border-strong` (3.44:1 light / 3.99:1 dark)
to satisfy WCAG 1.4.11.

### The Rare Wine Rule

Wine communicates identity and action. Ordinary categories, informational
badges, and structural borders stay neutral. When in doubt, the answer is
grey — a page with too much wine reads as an error state.

**Status colours** (`--status-success` / `-danger` / `-info`) are semantic
and stay. "Dana keluar = merah" is a hard convention, not decoration, and
must survive any palette change.

## Typography

One sans family throughout, plus a display face used for headings.
Georgia is declared but unreachable in practice — treat serif as the print
bulletin's own system (see §Print bulletin), not the web default.

### Hierarchy

Driven by `typography.scale` in the frontmatter. The steps below 12px exist
and are audited: every 8–11px usage in the repo is a fixed-format badge
(date, count, category chip) that never carries running prose. Anything a
person reads in a sentence is ≥12px, with body copy at 16px/1.6.

Use tabular numerals where schedules, dates, and financial figures need
column alignment.

## Layout

Public sections use a centred content width up to 80rem with responsive
gutters (`px-4 sm:px-6 lg:px-8`). Compact inside a group, generous between
groups. Cards form a grid only where comparison genuinely helps — ministry
schedules, service methods. Small screens stack without horizontal overflow.

Operator surfaces (admin, super, treasury) trade public-page spaciousness
for task completion and data density.

## Shapes

| Scale | Value | Use |
|---|---|---|
| `rounded-control` | 8px | inputs, small chips |
| `rounded-control-lg` | 12px | buttons, inner cards |
| `rounded-card` | 16px | content cards |
| `rounded-panel` | 24px | feature panels |
| `rounded-full` | — | badges, pills, avatars, status dots |

## Components

### Buttons

`variant="primary"` is wine with white text and a visible focus ring — and
the default, so nobody has to ask which variant to reach for. `neutral`,
`outline`, and `ghost` follow. In dark mode the primary fill measures
2.95:1 against the card surface, so it carries an explicit border to satisfy
1.4.11.

### Navigation

The header exposes **exactly one** control below `lg` — the menu trigger.
Theme and admin entry points live inside that drawer. At `lg` and above the
desktop nav carries the theme toggle and no hamburger. The two sets must
never co-render: an earlier revision had `hidden sm:flex` against
`flex lg:hidden`, which overlapped between 640–1024px and produced four
buttons with Admin floating in the middle.

## Do's and Don'ts

### Do
- Keep schedules, service contacts, and giving details factual and consistent
  with `INFO.md`.
- Verify text, icons, and focus indicators against the surface where they
  actually render, in **both** themes.
- Add a colour to this file's frontmatter before using it in a component.
- Make neutral category and status labels understandable without colour.

### Don't
- Use wine-red as a canvas, card, or structural border.
- Make an ordinary informational badge look like an error state.
- Use decorative crimson gradients, gradient text, or coloured glow as filler.
- Use thick coloured top or side bars on rounded cards.
- Add a new drop shadow when a 1px border would do the same job.
- Present a stylised placeholder QR pattern as a real scannable payment code.