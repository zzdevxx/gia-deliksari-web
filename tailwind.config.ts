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
      }
    },
  },
  plugins: [],
};

export default config;
