import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guards the class of bug that produced React error #418 on /info: a client
 * component computing a day boundary with host-local time, so the Workers
 * runtime (UTC) and a congregant's phone (WIB) disagree about which day it is
 * and React reports a hydration mismatch.
 *
 * Reads source rather than rendering, because the failure only appears when
 * the two zones actually differ, which a jsdom test cannot reproduce.
 */
const WIB_OFFSET_MS = 7 * 3_600_000;

describe('day boundaries are computed without the host timezone', () => {
  it('todayStart anchors to a fixed offset, not setHours', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/info/page.tsx'), 'utf8');

    const fn = source.match(/function todayStart\(\)[\s\S]*?\n\}/);
    expect(fn, 'todayStart not found').toBeTruthy();
    expect(fn![0]).not.toContain('setHours');
    expect(fn![0]).toContain('WIB_OFFSET_MS');
  });

  it('announcement dates parse as UTC, matching the boundary they compare against', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/info/page.tsx'), 'utf8');
    const filter = source.match(/const d = new Date\(`\$\{String\(a\.eventDate\)[\s\S]*?\);/);

    expect(filter, 'eventDate comparison not found or no longer pinned to UTC').toBeTruthy();
    expect(filter![0]).toContain('T00:00:00Z');
  });

  it('MiniCountdown pins its target to UTC midnight', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/info/MiniCountdown.tsx'),
      'utf8',
    );
    const parse = source.match(/const target = new Date\(`[\s\S]*?\)\.getTime\(\);/);

    expect(parse, 'MiniCountdown target parse not found').toBeTruthy();
    expect(parse![0]).toContain('T00:00:00Z');
  });

  it('demonstrates the disagreement it prevents', () => {
    // Two instants 7 hours apart, which is what the two runtimes produced.
    const utcMidnight = Date.UTC(2026, 9, 16, 0, 0);
    const wibMidnight = utcMidnight - WIB_OFFSET_MS;

    expect(utcMidnight).not.toBe(wibMidnight);

    // With a fixed offset, both sides land on the same instant.
    const boundary = (nowMs: number) => {
      const shifted = new Date(nowMs + WIB_OFFSET_MS);
      return (
        Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) -
        WIB_OFFSET_MS
      );
    };

    // 2026-10-16 11:32 UTC and 2026-10-16 18:32 WIB are the same moment.
    expect(boundary(Date.UTC(2026, 9, 16, 11, 32))).toBe(
      boundary(Date.UTC(2026, 9, 16, 18, 32) - WIB_OFFSET_MS),
    );
  });
});
