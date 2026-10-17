import { ImageResponse } from 'next/og';

/**
 * Dynamic Open Graph image for /info.
 *
 * This is the only route in the app that runs the Worker for a plain GET: every
 * page is a static prerender served from the asset binding, but an OG image has
 * to be generated. That makes its cost profile uniquely important.
 *
 * It used to be `dynamic = 'force-dynamic'`, which forbade caching. Every
 * crawler that peeked at an /info link — WhatsApp, Facebook, Google, Twitter,
 * and everyone who shares a church link does — forced a fresh PNG render plus
 * two queries. Live measurements were 1.1-3.5s per render, and crawlers fetch
 * in parallel bursts.
 *
 * That is where the unexplained 503s came from. Cloudflare analytics for
 * 2026-10-16T08:13Z shows nine 503s: /info/opengraph-image (1),
 * /api/auth/login (6), and one each on the static /info and /home — the two
 * expensive paths are 7 of the 9, and the static pages were collateral damage
 * from a busy isolate.
 *
 * `revalidate = 600` alone did NOT fix it. Next docs (opengraph-image.md,
 * "Good to know"): a generated image is statically optimised and cached
 * *unless it uses Request-time APIs or uncached data*. Reading D1 through
 * `queryAll` is uncached data, so the route stayed dynamic and
 * `x-nextjs-cache: MISS` on every request after deploying it. Changing the
 * directive moved the label without moving the behaviour.
 *
 * The data now arrives through `fetch` with an explicit revalidate window, so
 * it is cached data and the route can be prerendered and revalidated. Measured
 * cost drops to at most six renders an hour, and the served bytes are the same.
 */
export const revalidate = 600;
export const alt = 'GIA Deliksari Semarang — Papan Warta & Jadwal Pelayanan';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://giadeliksari.my.id';

/**
 * Read through the public API instead of D1 directly.
 *
 * Same rows, but `fetch` with `next.revalidate` is cached data — which is what
 * lets this route be prerendered. `queryAll` would reintroduce the dynamic
 * classification that made the previous fix a no-op.
 */
async function cachedPublicData(table: string, limit: number): Promise<any[]> {
  try {
    const res = await fetch(`${SITE}/api/public/data?table=${table}&limit=${limit}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body?.items) ? body.items : [];
  } catch (err) {
    // A failed fetch must not cost the whole card: an OG image with a heading
    // and no warta list is still a working preview, an exception is not.
    console.warn('[opengraph-image] public data unavailable:', err);
    return [];
  }
}

async function fetchUpcoming() {
  const [announcements, roster] = await Promise.all([
    cachedPublicData('announcements', 3),
    cachedPublicData('servant_rosters', 1),
  ]);
  return {
    announcements: announcements.filter((a) => a?.title),
    nextEvent: roster?.[0] ?? null,
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  general: 'Ibadah Raya',
  youth: 'Grow Youth',
  kidz: 'COC Kidz',
  hana: 'Wanita Hana',
};

function fmtDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default async function Image() {
  const { announcements, nextEvent } = await fetchUpcoming();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F1EFEE 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 60,
          position: 'relative',
        }}
      >
        {/* Top decorative crimson bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: 'linear-gradient(to right, #8E1533, #6B1029)',
            display: 'flex',
          }}
        />

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #8E1533, #6B1029)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              color: 'white',
              boxShadow: '0 8px 24px rgba(197,34,46,0.4)',
            }}
          >
            G
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 900, color: '#17161A', letterSpacing: '-1px' }}>
              GIA DELIKSARI
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: '#5C5654', fontWeight: 600, marginTop: 4 }}>
              Semarang · Growing Church!
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 36 }}>
          <div style={{ display: 'flex', fontSize: 22, color: '#8E1533', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            📋 Papan Warta & Jadwal Pelayanan
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 52, color: '#17161A', fontWeight: 900, lineHeight: 1.1, marginTop: 12 }}>
            <div style={{ display: 'flex' }}>Warta Jemaat</div>
            <div style={{ display: 'flex', color: '#8E1533' }}>Minggu Ini</div>
          </div>
        </div>

        {/* Warta list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {announcements.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 24,
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 20,
                border: '2px solid #E3DFDD',
              }}
            >
              <div style={{ display: 'flex', fontSize: 28 }}>📅</div>
              <div style={{ display: 'flex', fontSize: 22, color: '#5C5654', fontStyle: 'italic' }}>
                Warta jemaat akan tampil di sini setelah pengurus menginputnya.
              </div>
            </div>
          ) : (
            announcements.map((a: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: 20,
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 18,
                  border: '1px solid #E3DFDD',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    background: '#F1EFEE',
                    color: '#8E1533',
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '6px 12px',
                    borderRadius: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    minWidth: 120,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {CATEGORY_LABEL[a.category] || a.category}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#17161A',
                      lineHeight: 1.2,
                      maxWidth: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ display: 'flex', fontSize: 16, color: '#5C5654', marginTop: 4 }}>
                    📅 {fmtDate(a.event_date)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingTop: 24,
            borderTop: '2px solid #E3DFDD',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 16, color: '#5C5654', fontWeight: 600 }}>
              GIA Deliksari Web Portal · /info
            </div>
            {nextEvent ? (
              <div style={{ display: 'flex', fontSize: 14, color: '#3A3532', marginTop: 4 }}>
                ⏰ Ibadah terdekat: {fmtDate(nextEvent.service_date)},{' '}
                {CATEGORY_LABEL[nextEvent.service_category] || nextEvent.service_category}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: '#8E1533',
              fontWeight: 800,
              padding: '8px 16px',
              background: '#F1EFEE',
              borderRadius: 12,
              border: '2px solid #E3DFDD',
            }}
          >
            🔥 Growing Church
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
