import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GIA Deliksari Semarang — Growing Church',
    short_name: 'GIA Deliksari',
    description: 'Website Resmi Gereja Isa Almasih Deliksari Semarang. Jadwal Ibadah, Warta Jemaat, Roster Pelayanan, Permohonan Doa & Khotbah.',
    start_url: '/',
    display: 'standalone',
    background_color: '#150B0D',
    theme_color: '#C5222E',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
