import { NextResponse } from 'next/server';

/**
 * A 503 this Worker emitted on purpose, marked so it cannot be confused with an
 * upstream 503.
 *
 * Why the marker matters: during the 16 Oct 2026 investigation into "/media
 * returns 503", the first four hours were spent on the wrong layer. A 503 seen
 * in a browser Network panel says nothing about who produced it — Cloudflare's
 * edge, an upstream origin, the Worker, or (as it turned out) the service
 * worker in the visitor's own browser inventing one. All of them look the same.
 *
 * So every 503 this codebase emits on purpose identifies itself:
 *   - `source: 'gia-worker'`  → our code answered, the body is ours
 *   - `code`                  → which guard fired, machine-readable
 *   - `X-Served-By: gia-worker` and `Cache-Control: no-store`
 *
 * An upstream 503 has an empty or HTML body and no such header. One `curl -i`
 * then settles the question instead of an afternoon of inference.
 *
 * `no-store` is not decoration: a cached 503 would keep telling visitors the
 * site is down after the underlying problem was fixed.
 */
export function workerUnavailable(code: string, message: string) {
  return NextResponse.json(
    { error: message, source: 'gia-worker', code },
    {
      status: 503,
      headers: {
        'X-Served-By': 'gia-worker',
        'Cache-Control': 'no-store',
      },
    },
  );
}

/**
 * The two gallery guards, which are the same failure with a different cause.
 * Kept as a named wrapper so the routes read as intent rather than plumbing.
 */
export function driveUnavailable(code: string, message: string) {
  return workerUnavailable(code, message);
}
