import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * Pins the rule that a 503 this codebase emits on purpose identifies itself.
 *
 * Context: the 16 Oct 2026 investigation into "/media returns 503" chased the
 * wrong layer for hours, because a 503 in a Network panel cannot be attributed.
 * It can come from Cloudflare's edge, an upstream origin, our Worker, or — as
 * that investigation eventually found — the service worker in the visitor's own
 * browser manufacturing one. All four are visually identical.
 *
 * The fix is that every deliberate 503 goes through `workerUnavailable` in
 * src/lib/httpErrors.ts, which sets `source: 'gia-worker'`, a machine-readable
 * `code`, an `X-Served-By` header and `Cache-Control: no-store`. An upstream 503
 * carries none of those, so one `curl -i` answers "which side replied".
 *
 * This test walks src/ so a new route cannot quietly reintroduce a bare 503.
 */

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe('deliberate 503s identify themselves', () => {
  const root = resolve(process.cwd(), 'src');
  const files = walk(root);

  it('only one module constructs a 503 — the shared helper', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      // Strip comments so documentation mentioning 503 does not count.
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      if (/status:\s*503/.test(code)) {
        offenders.push(file.replace(process.cwd() + '/', ''));
      }
    }

    expect(
      offenders,
      'A deliberate 503 must go through workerUnavailable() in src/lib/httpErrors.ts ' +
        'so it can be told apart from an upstream 503.',
    ).toEqual(['src/lib/httpErrors.ts']);
  });

  it('the helper marks every 503 well enough to attribute it', () => {
    const src = readFileSync(resolve(root, 'lib/httpErrors.ts'), 'utf8');
    expect(src).toContain("source: 'gia-worker'");
    expect(src).toContain('X-Served-By');
    expect(src).toContain("'Cache-Control': 'no-store'");
    // A cached 503 would keep telling visitors the site is down after the fault
    // was fixed, so no-store is part of the contract, not a nicety.
    expect(src).toMatch(/status:\s*503/);
  });

  it('the gallery guards route through the helper', () => {
    const sync = readFileSync(resolve(root, 'app/api/gallery/sync/route.ts'), 'utf8');
    const upload = readFileSync(resolve(root, 'app/api/gallery/upload/route.ts'), 'utf8');

    expect(sync).toContain('driveUnavailable(');
    expect(upload).toContain('driveUnavailable(');
    // Each call site names which guard fired.
    expect(sync).toContain("'folder_id_unset'");
    expect(sync).toContain("'drive_client_unconfigured'");
    expect(upload).toContain("'drive_rejected_and_no_fallback'");
  });
});
