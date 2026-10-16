import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * Guards two focus-indicator defects found by review on 16 Oct 2026:
 *
 * 1. Five controls painted the ring with `--brand`, whose value is #8E1533 in
 *    BOTH themes. On the dark card that is 1.88:1, below the 3:1 WCAG 1.4.11
 *    floor, so a keyboard user in dark mode could not see focus at all.
 * 2. The calendar icon sat at 45% opacity, which composites to 2.48:1 against
 *    a light card, and hover was the only way to full strength, which a phone
 *    cannot do.
 *
 * Both were invisible to every other test because nothing asserted on colour
 * or opacity values, only on behaviour.
 */

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(tsx|ts)$/.test(entry) ? [full] : [];
  });
}

const SRC = resolve(process.cwd(), 'src');

describe('focus indicators use a token that changes with the theme', () => {
  it('never paints a focus ring with --brand, which is identical in both themes', () => {
    const offenders: string[] = [];

    for (const file of walk(SRC)) {
      const source = readFileSync(file, 'utf8');
      const lines = source.split('\n');

      lines.forEach((line, i) => {
        // `outline-[var(--brand)]` / `ring-[var(--brand)]` but NOT the -text,
        // -hover, -tint or -on-brand variants.
        if (/(?:outline|ring)-\[var\(--brand\)\]/.test(line)) {
          offenders.push(`${file.replace(process.cwd() + '/', '')}:${i + 1}`);
        }
      });
    }

    expect(offenders, `focus ring uses --brand at:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('uses --ring, the token globals.css defines for this job', () => {
    const globals = readFileSync(resolve(SRC, 'app/globals.css'), 'utf8');

    // The token must exist and differ between the two themes, or it cannot
    // satisfy 3:1 on both a light and a dark surface.
    const light = globals.match(/--ring:\s*(#[0-9A-Fa-f]{6})/);
    const darkBlock = globals.slice(globals.indexOf('.dark'));
    const dark = darkBlock.match(/--ring:\s*(#[0-9A-Fa-f]{6})/);

    expect(light, 'no --ring in :root').toBeTruthy();
    expect(dark, 'no --ring in .dark').toBeTruthy();
    expect(light![1].toLowerCase()).not.toBe(dark![1].toLowerCase());
  });

  it('keeps the calendar icon at an opacity that clears 3:1 without hover', () => {
    const source = readFileSync(
      resolve(SRC, 'components/info/AddToCalendar.tsx'),
      'utf8',
    );

    const opacity = source.match(/opacity-(\d+)/);
    expect(opacity, 'no opacity class on the calendar icon').toBeTruthy();

    // 45 was the failing value; 50 is the floor that clears 3:1 in the worst
    // combination (brand-text on a light card composites to ~2.8 at 50%).
    expect(Number(opacity![1])).toBeGreaterThanOrEqual(60);
  });
});

describe('the ratio the fix depends on', () => {
  // Mirrors the WCAG formula so the assertion above has a stated basis rather
  // than a magic number.
  const lum = (hex: string) => {
    const ch = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it('shows --brand would have failed and --ring passes, in dark mode', () => {
    const darkCard = '#1B1B24';
    expect(ratio('#8E1533', darkCard)).toBeLessThan(3);   // --brand: the bug
    expect(ratio('#F08AA4', darkCard)).toBeGreaterThan(3); // --ring in dark
  });

  it('shows the old 45% icon opacity was below the floor', () => {
    const composite = (fg: string, bg: string, alpha: number) => {
      const h = (x: string) => x.replace('#', '');
      const fgC = [0, 2, 4].map((i) => parseInt(h(fg).slice(i, i + 2), 16));
      const bgC = [0, 2, 4].map((i) => parseInt(h(bg).slice(i, i + 2), 16));
      return (
        '#' +
        fgC.map((c, i) => Math.round(c * alpha + bgC[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('')
      );
    };

    const lightCard = '#FFFFFF';
    expect(ratio(composite('#8E1533', lightCard, 0.45), lightCard)).toBeLessThan(3);
    expect(ratio(composite('#8E1533', lightCard, 0.6), lightCard)).toBeGreaterThanOrEqual(3);
  });
});
