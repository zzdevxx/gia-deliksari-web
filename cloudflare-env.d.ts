import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    GALLERY_BUCKET?: R2Bucket;
    NEXT_INC_CACHE_R2_BUCKET?: R2Bucket;
    R2_PUBLIC_URL?: string;
    ADMIN_SESSION_SECRET?: string;
    GALLERY_SYNC_SECRET?: string;
    GOOGLE_OAUTH_CLIENT_ID?: string;
    GOOGLE_OAUTH_CLIENT_SECRET?: string;
    GOOGLE_OAUTH_REFRESH_TOKEN?: string;
    GOOGLE_DRIVE_PUBLIC_FOLDER_ID?: string;
    YOUTUBE_API_KEY?: string;
    YOUTUBE_CHANNEL_ID?: string;
  }
}
