'use client';

import React, { useEffect } from 'react';
import { X, Printer, Flame, Baby, HeartHandshake, Calendar, Bell } from 'lucide-react';
import type { Announcement, ServantRoster, MinistryCategory } from '@/types';

/**
 * Bulletin Cetak siap-cetak untuk di-share via WA / ditempel di papan warta.
 *
 * Opens a new window with print-friendly A4 layout. After load, auto-invokes
 * window.print() — user can choose "Save as PDF" di dialog print browser.
 *
 * No external PDF library: relies on browser native print-to-PDF. Works in
 * Chrome, Edge, Firefox, Safari. Keeps the bundle clean.
 *
 * Window closes after print OR cancel. If the popup is blocked, we fallback
 * to same-tab print via @media print CSS in info/page.tsx.
 */

interface BulletinProps {
  announcements: Announcement[];
  rosters: ServantRoster[];
  weekLabel: string;
}

const CATEGORY_LABEL: Record<MinistryCategory, string> = {
  general: 'Ibadah Raya',
  youth: 'Grow Generation Youth',
  kidz: 'COC Kidz',
  hana: 'Wanita Hana & Komsel',
  all: 'Umum',
};

function fmtDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtShortDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const PrintBulletin: React.FC<BulletinProps> = ({ announcements, rosters, weekLabel }) => {
  useEffect(() => {
    // Trigger print dialog after content paints
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {
        /* popup blocked or print failed — silently ignore */
      }
    }, 350);
    return () => clearTimeout(t);
  }, []);

  // Split rosters by community for clean grouping
  const byCat: Record<string, ServantRoster[]> = {};
  rosters
    .slice()
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))
    .forEach((r) => {
      if (!byCat[r.serviceCategory]) byCat[r.serviceCategory] = [];
      byCat[r.serviceCategory].push(r);
    });

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 12mm; }
        @media print {
          body { margin: 0; padding: 0; background: #fff !important; }
          .no-print { display: none !important; }
        }
        body {
          font-family: Georgia, 'Times New Roman', serif;
          color: #1C1917;
          background: #FAF7F2;
          margin: 0;
          padding: 24px;
          line-height: 1.5;
        }
        .bulletin-container {
          max-width: 210mm;
          margin: 0 auto;
          background: #fff;
          padding: 8mm 6mm;
        }
        .bulletin-header {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 3px solid #8B1E28;
          margin-bottom: 24px;
        }
        .bulletin-header h1 {
          color: #8B1E28;
          font-size: 26px;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
          font-weight: 800;
        }
        .bulletin-header .subtitle {
          font-size: 12px;
          color: #665E55;
          margin-bottom: 8px;
        }
        .bulletin-header .tagline {
          font-size: 14px;
          color: #8C6826;
          font-weight: 700;
          margin-top: 4px;
        }
        .bulletin-section {
          margin-bottom: 24px;
          page-break-inside: avoid;
        }
        .bulletin-section h2 {
          color: #8B1E28;
          font-size: 18px;
          margin: 0 0 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #E5DFD5;
          font-weight: 800;
        }
        .warta-item {
          padding: 10px 12px;
          margin-bottom: 8px;
          background: #FAF7F2;
          border: 1px solid #E5DFD5;
          border-radius: 6px;
        }
        .warta-item .title {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 2px;
        }
        .warta-item .meta {
          font-size: 11px;
          color: #665E55;
          margin-bottom: 4px;
        }
        .warta-item .badge {
          display: inline-block;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          background: #F3EFE6;
          color: #8B1E28;
          border: 1px solid #E5DFD5;
          margin-right: 4px;
        }
        .warta-item .content {
          font-size: 12px;
          white-space: pre-wrap;
        }
        .roster-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .roster-table th {
          background: #8B1E28;
          color: #fff;
          padding: 6px 8px;
          text-align: left;
          font-weight: 700;
        }
        .roster-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #E5DFD5;
        }
        .roster-table tr:nth-child(even) td {
          background: #FAF7F2;
        }
        .community-section {
          margin-bottom: 16px;
        }
        .community-section h3 {
          font-size: 13px;
          color: #731820;
          margin: 0 0 6px;
          font-weight: 800;
          padding: 4px 8px;
          background: #F3EFE6;
          border-radius: 4px;
          display: inline-block;
        }
        .bulletin-footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 2px solid #E5DFD5;
          text-align: center;
          font-size: 10px;
          color: #665E55;
        }
        .bulletin-footer .contact {
          margin-top: 4px;
          font-weight: 700;
          color: #8B1E28;
        }
        .toolbar {
          position: sticky;
          top: 0;
          background: #fff;
          padding: 12px;
          border-bottom: 1px solid #E5DFD5;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          z-index: 100;
        }
        .toolbar button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }
        .btn-print {
          background: linear-gradient(to right, #8B1E28, #731820);
          color: #fff;
        }
        .btn-close {
          background: #F3EFE6;
          color: #665E55;
        }
      `}</style>

      <div className="toolbar no-print">
        <button className="btn-close" onClick={() => window.close()}>
          <X className="w-3.5 h-3.5 inline-block mr-1" />
          Tutup
        </button>
        <button className="btn-print" onClick={() => window.print()}>
          <Printer className="w-3.5 h-3.5 inline-block mr-1" />
          Cetak / Save PDF
        </button>
      </div>

      <div className="bulletin-container">
        <div className="bulletin-header">
          <h1>GEREJA ISA ALMASIH DELIKSARI</h1>
          <div className="subtitle">Jl. Kolonel HR Hadijanto, Sekaran, Gn. Pati, Semarang 50229</div>
          <div className="tagline">🌱 Growing Church!</div>
          <div style={{ fontSize: 13, marginTop: 8, color: '#1C1917', fontWeight: 600 }}>
            Warta Jemaat &amp; Jadwal Pelayanan — {weekLabel}
          </div>
        </div>

        <div className="bulletin-section">
          <h2>
            <Bell style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: '-3px', marginRight: 6 }} />
            Papan Warta
          </h2>
          {announcements.length === 0 ? (
            <p style={{ fontSize: 12, color: '#665E55', fontStyle: 'italic' }}>
              Belum ada warta untuk periode ini.
            </p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="warta-item">
                <div className="title">
                  {a.isPinned && <span className="badge">📌 Pin</span>}
                  {a.badgeText && <span className="badge">{a.badgeText}</span>}
                  <span className="badge" style={{ background: '#FEF9EC', color: '#8C6826', borderColor: '#F5DFAB' }}>
                    {CATEGORY_LABEL[a.category] || a.category}
                  </span>
                  {a.title}
                </div>
                <div className="meta">
                  📅 {fmtDate(a.eventDate)}
                  {a.endDate && a.endDate !== a.eventDate ? ` s/d ${fmtDate(a.endDate)}` : ''}
                  {a.author && ` · oleh ${a.author}`}
                </div>
                <div className="content">{a.content}</div>
              </div>
            ))
          )}
        </div>

        <div className="bulletin-section">
          <h2>
            <Calendar style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: '-3px', marginRight: 6 }} />
            Jadwal Pelayanan
          </h2>
          {Object.keys(byCat).length === 0 ? (
            <p style={{ fontSize: 12, color: '#665E55', fontStyle: 'italic' }}>
              Belum ada jadwal pelayanan untuk periode ini.
            </p>
          ) : (
            Object.entries(byCat).map(([cat, items]) => {
              const label = CATEGORY_LABEL[cat as MinistryCategory] || cat;
              const Icon = cat === 'youth' ? Flame : cat === 'kidz' ? Baby : cat === 'hana' ? HeartHandshake : Calendar;
              return (
                <div key={cat} className="community-section">
                  <h3>
                    <Icon style={{ width: 13, height: 13, display: 'inline-block', verticalAlign: '-2px', marginRight: 4 }} />
                    {label}
                  </h3>
                  <table className="roster-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Peran</th>
                        <th>Nama Pelayan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r) => (
                        <tr key={r.id}>
                          <td style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontWeight: 600 }}>
                            {fmtShortDate(r.serviceDate)}
                          </td>
                          <td>{r.role}</td>
                          <td>
                            {r.servantName}
                            {r.status === 'pending' && <span style={{ marginLeft: 6, color: '#8C6826', fontSize: 10 }}>(konfirmasi)</span>}
                            {r.status === 'replacement' && <span style={{ marginLeft: 6, color: '#A0442C', fontSize: 10 }}>(pengganti)</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>

        <div className="bulletin-footer">
          <div>Dicetak dari Portal GIA Deliksari — {new Date().toLocaleString('id-ID')}</div>
          <div className="contact">
            Pastoral: 0896-2096-1103 · Email: giadeliksarichurch@gmail.com
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintBulletin;