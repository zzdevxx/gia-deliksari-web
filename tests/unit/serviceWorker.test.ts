import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guards the class of bug where the service worker invents an HTTP status code
 * that belongs to the server.
 *
 * `public/sw.js` used to answer a failed public-API fetch with
 * `new Response('Offline', { status: 503 })`. The browser then reported a 503
 * that never touched Cloudflare. Two costs followed:
 *
 *   1. A congregant on a weak mobile connection — cache miss plus network
 *      failure, which is ordinary on a phone, not an outage — saw what looked
 *      like the church website being down.
 *   2. Real upstream 503s became untriageable. The 16 Oct 2026 investigation
 *      into "/media returns 503" spent hours on the origin before the source
 *      turned out to be here, in the browser, because both look identical in
 *      a Network panel.
 *
 * Reads the source rather than executing the worker: the failure only appears
 * when cache and network both miss, which a jsdom test cannot reproduce. This
 * mirrors tests/unit/hydration-tz.test.ts, which guards a similarly
 * unreproducible condition the same way.
 */
describe('service worker does not fabricate server status codes', () => {
  const sw = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

  it('does not construct a 503 response', () => {
    // A 5xx may be *described* in a comment; what must not exist is a Response
    // built with that status. Strip block and line comments before checking so
    // the documentation above stays allowed.
    const executable = sw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');

    expect(executable).not.toMatch(/status:\s*5\d\d/);
  });

  it('answers an unreachable public API with an offline envelope, not a failure', () => {
    expect(sw).toContain('function offlineEnvelope');
    // The SWR branch must route its last resort through the envelope.
    expect(sw).toMatch(/cached \|\| \(await network\) \|\| offlineEnvelope\(\)/);
  });

  it('marks the offline envelope so it can be told apart from a real response', () => {
    const fn = sw.match(/function offlineEnvelope\(\)[\s\S]*?\n\}/);
    expect(fn, 'offlineEnvelope not found').toBeTruthy();
    expect(fn![0]).toContain('offline: true');
    expect(fn![0]).toContain('X-Served-By');
    // `status: 200` is the point: the request completed, the origin had nothing
    // to add, and the page's seed data is already a valid rendering of that.
    expect(fn![0]).toContain('status: 200');
    expect(fn![0]).toContain('no-store');
  });

  it('bumped the cache version so clients holding the old script are replaced', () => {
    // Without a bump, a browser that already cached the v2 worker keeps
    // fabricating 503s and the fix never reaches it.
    expect(sw).toMatch(/const CACHE_VERSION = 'gia-v3'/);
  });
});
