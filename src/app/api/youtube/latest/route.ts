import { NextResponse } from 'next/server';
import { INITIAL_SERMONS } from '@/lib/seedData';
import { Sermon } from '@/types';

// In-memory cache to conserve YouTube API quota (10,000 units/day)
let cachedVideos: Sermon[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 1000 * 60 * 60 * 2; // 2 hours

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || 'UCgiadeliksarisemarang';

  // Return cached result if valid
  const now = Date.now();
  if (cachedVideos && now - lastFetchTime < CACHE_DURATION_MS) {
    return NextResponse.json({
      source: 'cache',
      sermons: cachedVideos,
    });
  }

  // If no API key configured, gracefully fallback to seed/D1 sermons
  if (!apiKey) {
    return NextResponse.json({
      source: 'fallback',
      message: 'YouTube API Key belum disetel di environment variable. Menampilkan arsip kurasi.',
      sermons: INITIAL_SERMONS,
    });
  }

  try {
    // 1. Fetch channel's uploaded videos via YouTube Data API v3
    // Search for latest videos from channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6&type=video`;
    
    const response = await fetch(searchUrl, { next: { revalidate: 7200 } });
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({
        source: 'fallback',
        sermons: INITIAL_SERMONS,
      });
    }

    const fetchedSermons: Sermon[] = data.items.map((item: any, idx: number) => {
      const title = item.snippet.title || 'Khotbah GIA Deliksari';
      const publishedAt = new Date(item.snippet.publishedAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const videoId = item.id.videoId;
      const thumbnail = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '/images/gallery-2.jpg';

      return {
        id: `yt-${videoId || idx}`,
        title: title,
        speaker: 'Ps. Yohanes Sutono / Pelayan Firman',
        passage: item.snippet.description ? item.snippet.description.slice(0, 50) + '...' : 'Firman Tuhan',
        date: publishedAt,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: thumbnail,
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
    return NextResponse.json({
      source: 'fallback_on_error',
      error: err.message,
      sermons: INITIAL_SERMONS,
    });
  }
}
