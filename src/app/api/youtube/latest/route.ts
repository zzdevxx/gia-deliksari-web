import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/d1';
import { INITIAL_SERMONS } from '@/lib/seedData';
import { Sermon } from '@/types';

// In-memory cache to conserve YouTube API quota (10,000 units/day)
let cachedVideos: Sermon[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 1000 * 60 * 60 * 2; // 2 hours

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || 'UCDh3ojx9ne3HOPoBuuoKlrg';

  // Return cached result if valid
  const now = Date.now();
  if (cachedVideos && now - lastFetchTime < CACHE_DURATION_MS) {
    return NextResponse.json({
      source: 'cache',
      sermons: cachedVideos,
    });
  }

  // Helper to fallback to D1 database then seed
  const fallbackToDatabaseOrSeed = async (sourceReason: string, errorDetail?: string) => {
    try {
      const rows = await queryAll<any>(
        'SELECT * FROM sermons WHERE is_published = 1 ORDER BY created_at DESC LIMIT 6',
      );
      if (rows && rows.length > 0) {
        const mapped: Sermon[] = rows.map((s) => ({
          id: s.id,
          title: s.title,
          speaker: s.speaker,
          passage: s.passage,
          date: s.date,
          youtubeUrl: s.youtube_url || s.youtubeUrl,
          thumbnail: s.thumbnail || '/images/gallery-2.jpg',
          category: s.category || 'Ibadah Raya',
          createdAt: s.created_at || s.createdAt,
        }));
        cachedVideos = mapped;
        lastFetchTime = now;
        return NextResponse.json({
          source: 'd1_database',
          message: sourceReason,
          error: errorDetail,
          sermons: mapped,
        });
      }
    } catch (d1Err) {
      console.warn('[youtube/latest] D1 fallback query error:', d1Err);
    }

    return NextResponse.json({
      source: 'fallback',
      message: sourceReason,
      error: errorDetail,
      sermons: INITIAL_SERMONS,
    });
  };

  // If no API key configured, gracefully fallback to D1 / seed
  if (!apiKey) {
    return fallbackToDatabaseOrSeed('YouTube API Key belum disetel di environment variable. Menampilkan arsip kurasi.');
  }

  try {
    // 1. Efficient fetch via playlistItems (Uploads playlist = UU + channelId[2..])
    // Quota cost: 1 unit (vs search.list which costs 100 units)
    const uploadsPlaylistId = channelId.startsWith('UC') ? `UU${channelId.slice(2)}` : channelId;
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=6`;

    let response = await fetch(playlistUrl, { next: { revalidate: 7200 } });
    let data: any = null;

    if (response.ok) {
      data = await response.json();
    } else {
      // Fallback: search.list if uploads playlist is not directly available
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6&type=video`;
      response = await fetch(searchUrl, { next: { revalidate: 7200 } });
      if (response.ok) {
        data = await response.json();
      }
    }

    if (!data?.items || data.items.length === 0) {
      return fallbackToDatabaseOrSeed('Belum ada video khotbah terbaru di YouTube.');
    }

    const fetchedSermons: Sermon[] = data.items.map((item: any, idx: number) => {
      const title = item.snippet.title || 'Khotbah GIA Deliksari';
      const publishedAt = new Date(item.snippet.publishedAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const videoId = item.snippet.resourceId?.videoId || item.id?.videoId;
      const thumbnail =
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        '/images/gallery-2.jpg';

      return {
        id: `yt-${videoId || idx}`,
        title,
        speaker: 'Ps. Yohanes Sutono / Pelayan Firman',
        passage: item.snippet.description ? item.snippet.description.slice(0, 50) + '...' : 'Firman Tuhan',
        date: publishedAt,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail,
        category: 'Ibadah Raya',
        createdAt: item.snippet.publishedAt,
      };
    });

    cachedVideos = fetchedSermons;
    lastFetchTime = now;

    return NextResponse.json({
      source: 'youtube_api',
      sermons: fetchedSermons,
    });
  } catch (err: any) {
    console.error('Error fetching YouTube API:', err);
    return fallbackToDatabaseOrSeed('Gagal memuat video dari YouTube API.', err.message);
  }
}
