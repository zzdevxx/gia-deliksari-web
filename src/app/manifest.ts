import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GIA Deliksari Semarang: Growing Church',
    short_name: 'GIA Deliksari',
    description:
      'Website Resmi Gereja Isa Almasih Deliksari Semarang. Jadwal Ibadah, Warta Jemaat, Roster Pelayanan, Permohonan Doa & Khotbah.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#8B1E28',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/images/logo.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      },
    ],
  };
}
