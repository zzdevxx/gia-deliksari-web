import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // ── Canonical Flat semantic layer ────────────────────────────────────
        // Prefer these over raw hex. Each has a light/dark pair defined in
        // globals.css, so a theme switch needs no per-component edits.
        //
        // `--brand` is the CTA *fill* (needs white text ≥4.5:1 on top).
        // `--brand-text` is the brand colour used as *text/icon* on tinted or
        // dark surfaces. One hex cannot do both jobs — hence two tokens.
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          text: 'var(--brand-text)',
          'text-hover': 'var(--brand-text-hover)',
          // Brand-coloured TEXT sitting on a brand FILL. --brand-text only
          // reaches 3.85:1 there; this reaches 4.59:1.
          'text-on-brand': 'var(--brand-text-on-brand)',
          tint: 'var(--brand-tint)',
          'tint-border': 'var(--brand-tint-border)',
          'tint-ink': 'var(--brand-tint-ink)',
        },
        // Interactive boundary — WCAG 1.4.11 (≥3:1). Use for form fields,
        // secondary buttons and any divider that carries meaning.
        'border-strong': 'var(--border-strong)',
        // Raised/inset surface: table rows, code blocks, sunken panels.
        raised: 'var(--surface-raised)',
        'raised-hover': 'var(--surface-raised-hover)',
        // The deepest neutral that still clears 4.5:1 on the light canvas.
        // For subheadings that need more weight than `--muted-foreground`
        // without promoting themselves to a heading.
        'ink-strong': 'var(--ink-strong)',
        // Always-dark panels (vision banner, inverted cards). Separate from
        // `card` so they don't flip to white in light mode.
        inverted: {
          bg: 'var(--card-inverted-bg)',
          fg: 'var(--card-inverted-fg)',
          border: 'var(--card-inverted-border)',
        },
        status: {
          success: 'var(--status-success)',
          'success-fg': 'var(--status-success-fg)',
          danger: 'var(--status-danger)',
          'danger-fg': 'var(--status-danger-fg)',
          info: 'var(--status-info)',
          'info-fg': 'var(--status-info-fg)',
        },
        // @deprecated — the warm palette was retired in commit 8d50985. Kept
        // only so existing references keep resolving during migration; new
        // code must use the semantic tokens above.
        sacred: {
          wine: '#8B1E28',
          wineDark: '#B8323D',
          gold: '#4B5563',
          goldDark: '#9CA3AF',
          stone: '#FFFFFF',
          charcoal: '#0F1115',
          slate: '#171A21',
        },
        church: {
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          navy: {
            50: '#f0f4f8',
            100: '#d9e2ec',
            800: '#102a43',
            900: '#0b1d3a',
            950: '#071224',
          }
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },

      // ── Motion ────────────────────────────────────────────────────────────
      //
      // `tailwindcss-animate` supplies the `animate-in` / `fade-in` /
      // `zoom-in-95` / `slide-in-from-*` family. Those classes were already
      // used in 67 places across this codebase, but the plugin was never
      // installed and no matching keyframes existed in globals.css, so every
      // one of them rendered as a no-op: modals simply appeared, toasts
      // popped, and the login error banner never shook.
      //
      // Registering the plugin is therefore the whole fix for those 67 sites.
      keyframes: {
        // Not in tailwindcss-animate. Used by the login/error banners
        // (AdminDashboard, KasDashboard, LoginForm) to signal a rejected
        // submission. Small amplitude on purpose: a large shake reads as a
        // broken layout rather than a nudge.
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        shake: 'shake 320ms cubic-bezier(0.23, 1, 0.32, 1)',
      },

      // Strong easing curves. The CSS built-ins (ease, ease-in-out) are too
      // weak to read as intentional; ease-in in particular delays the first
      // frame, which is exactly the moment the user is watching.
      transitionTimingFunction: {
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
