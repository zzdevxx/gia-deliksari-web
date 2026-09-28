import { ImageResponse } from 'next/og';
import { queryAll } from '@/lib/d1';

/**
 * Dynamic Open Graph image for /info page.
 * Rendered on-demand, cached at edge.
 */

export const dynamic = 'force-dynamic';
export const alt = 'GIA Deliksari Semarang — Papan Warta & Jadwal Pelayanan';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function fetchUpcoming() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [announcements, roster] = await Promise.all([
      queryAll<any>(
        'SELECT title, category, event_date FROM announcements WHERE is_published = 1 AND event_date >= ? ORDER BY event_date ASC LIMIT 3',
        [today],
      ),
      queryAll<any>(
        'SELECT service_date, service_category FROM servant_rosters WHERE service_date >= ? ORDER BY service_date ASC LIMIT 1',
        [today],
      ),
    ]);
    return {
      announcements: announcements ?? [],
      nextEvent: roster?.[0] ?? null,
    };
  } catch (err) {
    console.warn('[opengraph-image] fetch error:', err);
    return { announcements: [], nextEvent: null };
  }
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
          background: 'linear-gradient(135deg, #FDFBF7 0%, #FDF0F0 100%)',
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
            background: 'linear-gradient(to right, #C5222E, #80141C)',
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
              background: 'linear-gradient(135deg, #C5222E, #80141C)',
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
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 900, color: '#1F1617', letterSpacing: '-1px' }}>
              GIA DELIKSARI
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: '#6E5D5F', fontWeight: 600, marginTop: 4 }}>
              Semarang · Growing Church!
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 36 }}>
          <div style={{ display: 'flex', fontSize: 22, color: '#9A1620', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            📋 Papan Warta & Jadwal Pelayanan
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 52, color: '#1F1617', fontWeight: 900, lineHeight: 1.1, marginTop: 12 }}>
            <div style={{ display: 'flex' }}>Warta Jemaat</div>
            <div style={{ display: 'flex', color: '#C5222E' }}>Minggu Ini</div>
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
                border: '2px solid #EBDDCF',
              }}
            >
              <div style={{ display: 'flex', fontSize: 28 }}>📅</div>
              <div style={{ display: 'flex', fontSize: 22, color: '#6E5D5F', fontStyle: 'italic' }}>
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
                  borderLeft: '8px solid #C5222E',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    background: '#FDF0F0',
                    color: '#9A1620',
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
                      color: '#1F1617',
                      lineHeight: 1.2,
                      maxWidth: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ display: 'flex', fontSize: 16, color: '#6E5D5F', marginTop: 4 }}>
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
            borderTop: '2px solid #EBDDCF',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 16, color: '#5A4D4E', fontWeight: 600 }}>
              GIA Deliksari Web Portal · /info
            </div>
            {nextEvent ? (
              <div style={{ display: 'flex', fontSize: 14, color: '#B87A14', marginTop: 4 }}>
                ⏰ Ibadah terdekat: {fmtDate(nextEvent.service_date)} —{' '}
                {CATEGORY_LABEL[nextEvent.service_category] || nextEvent.service_category}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: '#9A1620',
              fontWeight: 800,
              padding: '8px 16px',
              background: '#FDF0F0',
              borderRadius: 12,
              border: '2px solid #F5CDD0',
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
