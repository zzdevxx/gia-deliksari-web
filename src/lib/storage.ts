import { Announcement, ServantRoster, InventoryItem, Sermon, GalleryItem, MinistryRequest } from '@/types';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ROSTER,
  INITIAL_INVENTORY,
  INITIAL_SERMONS,
  INITIAL_GALLERY,
  INITIAL_MINISTRY_REQUESTS
} from './seedData';

const ANNOUNCEMENTS_KEY = 'gia_deliksari_announcements_v1';
const ROSTER_KEY = 'gia_deliksari_roster_v1';
const INVENTORY_KEY = 'gia_deliksari_inventory_v1';
const SERMONS_KEY = 'gia_deliksari_sermons_v1';
const GALLERY_KEY = 'gia_deliksari_gallery_v1';
const REQUESTS_KEY = 'gia_deliksari_requests_v1';

// ============================================================================
// MAPPERS (DB snake_case <-> App models)
// ============================================================================

function toAnnouncementModel(db: any): Announcement {
  return {
    id: db.id,
    title: db.title,
    category: db.category,
    content: db.content,
    eventDate: db.event_date || db.eventDate,
    isPinned: Boolean(db.is_pinned ?? db.isPinned),
    isPublished: db.is_published === 1 || db.is_published === true || (db.is_published === undefined && db.isPublished !== false),
    badgeText: db.badge_text || db.badgeText,
    author: db.author || 'Sekretariat GIA Deliksari',
    createdAt: db.created_at || db.createdAt,
  };
}

function toAnnouncementDB(model: Announcement) {
  return {
    id: model.id,
    title: model.title,
    category: model.category,
    content: model.content,
    event_date: model.eventDate,
    is_pinned: model.isPinned ? 1 : 0,
    is_published: model.isPublished ? 1 : 0,
    badge_text: model.badgeText,
    author: model.author,
  };
}

function toRosterModel(db: any): ServantRoster {
  return {
    id: db.id,
    serviceCategory: db.service_category || db.serviceCategory || 'general',
    serviceDate: db.service_date || db.serviceDate,
    role: db.role,
    servantName: db.servant_name || db.servantName,
    phone: db.phone,
    status: db.status || 'confirmed',
    notes: db.notes,
    createdAt: db.created_at || db.createdAt,
  };
}

function toRosterDB(model: ServantRoster) {
  return {
    id: model.id,
    service_category: model.serviceCategory,
    service_date: model.serviceDate,
    role: model.role,
    servant_name: model.servantName,
    phone: model.phone,
    status: model.status,
    notes: model.notes,
  };
}

function toInventoryModel(db: any): InventoryItem {
  return {
    id: db.id,
    name: db.name,
    category: db.category,
    code: db.code,
    quantity: db.quantity ?? 1,
    isChecked: db.is_checked === 1 || db.is_checked === true || (db.is_checked === undefined && db.isChecked !== false),
    condition: db.condition || 'good',
    location: db.location,
    notes: db.notes,
    lastCheckedAt: db.last_checked_at || db.lastCheckedAt,
    checkedBy: db.checked_by || db.checkedBy,
    createdAt: db.created_at || db.createdAt,
  };
}

function toInventoryDB(model: InventoryItem) {
  return {
    id: model.id,
    name: model.name,
    category: model.category,
    code: model.code,
    quantity: model.quantity,
    is_checked: model.isChecked ? 1 : 0,
    condition: model.condition,
    location: model.location,
    notes: model.notes,
    last_checked_at: model.lastCheckedAt,
    checked_by: model.checkedBy,
  };
}

function toSermonModel(db: any): Sermon {
  return {
    id: db.id,
    title: db.title,
    speaker: db.speaker,
    passage: db.passage,
    date: db.date,
    youtubeUrl: db.youtube_url || db.youtubeUrl,
    thumbnail: db.thumbnail || '/images/logo.png',
    category: db.category || 'Ibadah Raya',
    createdAt: db.created_at || db.createdAt,
  };
}

function toSermonDB(model: Sermon) {
  return {
    id: model.id,
    title: model.title,
    speaker: model.speaker,
    passage: model.passage,
    date: model.date,
    youtube_url: model.youtubeUrl,
    thumbnail: model.thumbnail,
    category: model.category,
    is_published: 1,
  };
}

function toGalleryModel(db: any): GalleryItem {
  return {
    id: db.id,
    title: db.title,
    category: db.category || 'ibadah',
    image: db.image || db.imageUrl || '/images/logo.png',
    thumbUrl: db.thumb_url || db.thumbUrl || db.image || db.imageUrl || '/images/logo.png',
    driveFileId: db.drive_file_id || db.driveFileId,
    driveWebViewLink: db.drive_web_view_link || db.driveWebViewLink,
    uploaderName: db.uploader_name || db.uploaderName,
    isPublished: db.is_published === 1 || db.is_published === true || (db.is_published === undefined && db.isPublished !== false),
    date: db.date,
    createdAt: db.created_at || db.createdAt,
  };
}

function toGalleryDB(model: GalleryItem) {
  return {
    id: model.id,
    title: model.title,
    category: model.category,
    image: model.image,
    thumb_url: model.thumbUrl || model.image,
    drive_file_id: model.driveFileId,
    drive_web_view_link: model.driveWebViewLink,
    uploader_name: model.uploaderName,
    is_published: model.isPublished === false ? 0 : 1,
    date: model.date,
  };
}

function toRequestModel(db: any): MinistryRequest {
  return {
    id: db.id,
    type: db.type,
    name: db.name,
    phone: db.phone,
    subType: db.sub_type || db.subType,
    message: db.message,
    needPastoralVisit: Boolean(db.need_pastoral_visit ?? db.needPastoralVisit),
    status: db.status || 'new',
    createdAt: db.created_at || db.createdAt || new Date().toISOString(),
  };
}

function toRequestDB(model: MinistryRequest) {
  return {
    id: model.id,
    type: model.type,
    name: model.name,
    phone: model.phone,
    sub_type: model.subType,
    message: model.message,
    need_pastoral_visit: model.needPastoralVisit ? 1 : 0,
    status: model.status,
  };
}

// ============================================================================
// SHARED HELPERS
// ============================================================================

type AnyModel = Announcement | ServantRoster | InventoryItem | Sermon | GalleryItem | MinistryRequest;

async function readViaApi<T>(
  endpoint: string,
  cacheKey: string,
  mapper: (db: any) => T,
  fallbackSeed: T[],
): Promise<T[]> {
  // 1. Primary source: server API (public sanitized or admin session-gated)
  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.items)) {
        if (json.items.length === 0) {
          // Table is intentionally empty in DB
          if (typeof window !== 'undefined') {
            try { localStorage.setItem(cacheKey, JSON.stringify([])); } catch {}
          }
          return [];
        }
        const list = json.items.map(mapper);
        if (typeof window !== 'undefined') {
          try { localStorage.setItem(cacheKey, JSON.stringify(list)); } catch {}
        }
        return list;
      }
    }
  } catch (err) {
    console.warn(`Fetch ${endpoint} failed, falling back:`, err);
  }

  // 2. Local cache, then bundled seed
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      try { return JSON.parse(local); } catch {}
    }
    try { localStorage.setItem(cacheKey, JSON.stringify(fallbackSeed)); } catch {}
  }
  return fallbackSeed;
}

async function writeViaApi(table: string, items: any[]): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, items }),
    });
    if (!res.ok) {
      console.error(`[adminDataStore] write ${table} rejected (${res.status}):`, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[adminDataStore] write ${table} network error:`, err);
    return false;
  }
}

async function deleteViaApi(table: string, id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/data?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      console.error(`[adminDataStore] delete ${table}/${id} rejected (${res.status}):`, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[adminDataStore] delete ${table}/${id} network error:`, err);
    return false;
  }
}

// ============================================================================
// PUBLIC DATA STORE — safe for visitors & shared components.
// Reads go through the sanitized public API (no phones, no request inbox);
// the only write is submitting one's own prayer/ministry request.
// ============================================================================
export const dataStore = {
  getAnnouncements: (): Promise<Announcement[]> =>
    readViaApi<Announcement>('/api/public/data?table=announcements', ANNOUNCEMENTS_KEY, toAnnouncementModel, INITIAL_ANNOUNCEMENTS),

  getRoster: (): Promise<ServantRoster[]> =>
    readViaApi<ServantRoster>('/api/public/data?table=servant_rosters', ROSTER_KEY, toRosterModel, INITIAL_ROSTER),

  getSermons: (): Promise<Sermon[]> =>
    readViaApi<Sermon>('/api/public/data?table=sermons', SERMONS_KEY, toSermonModel, INITIAL_SERMONS),

  getGallery: (): Promise<GalleryItem[]> =>
    readViaApi<GalleryItem>('/api/public/data?table=gallery_items', GALLERY_KEY, toGalleryModel, INITIAL_GALLERY),

  /**
   * Galeri etalase mode: hanya N foto acak (default 12) dari cache database D1.
   * Digunakan oleh GallerySection untuk etalase agar LCP tetap ringan.
   * Server melakukan Fisher-Yates shuffle deterministik (seeded by day)
   * sehingga 1x refresh halaman = etalase baru stabil sepanjang hari.
   */
  getRandomGallery: async (limit: number = 12): Promise<GalleryItem[]> => {
    try {
      const res = await fetch(
        `/api/public/data?table=gallery_items&random=true&limit=${limit}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json.items)) {
        return json.items.map(toGalleryModel);
      }
      return [];
    } catch (err) {
      console.warn('[dataStore] getRandomGallery failed, fallback to full getGallery:', err);
      return dataStore.getGallery();
    }
  },

  /** Public form submission — validated & rate-limited server-side. */
  saveMinistryRequest: async (item: MinistryRequest): Promise<boolean> => {
    let list: MinistryRequest[] = INITIAL_MINISTRY_REQUESTS;
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(REQUESTS_KEY);
      list = local ? JSON.parse(local) : INITIAL_MINISTRY_REQUESTS;
      list = [item, ...list.filter(r => r.id !== item.id)];
      try { localStorage.setItem(REQUESTS_KEY, JSON.stringify(list)); } catch {}
    }

    try {
      const res = await fetch('/api/public/ministry-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toRequestDB(item)),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      return true;
    } catch (err) {
      console.warn('[dataStore] ministry request submit failed:', err);
      return false;
    }
  },
};

// ============================================================================
// ADMIN DATA STORE — every operation flows through /api/admin/data, which
// enforces the signed admin session cookie server-side with Cloudflare D1.
// ============================================================================
export const adminDataStore = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const list = await readViaApi<Announcement>('/api/admin/data?table=announcements', ANNOUNCEMENTS_KEY, toAnnouncementModel, INITIAL_ANNOUNCEMENTS);
    return list;
  },

  saveAnnouncements: async (items: Announcement[]) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(items)); } catch {}
    }
    await writeViaApi('announcements', items.map(toAnnouncementDB));
  },

  deleteAnnouncement: (id: string): Promise<boolean> =>
    deleteViaApi('announcements', id),

  getRoster: (): Promise<ServantRoster[]> =>
    readViaApi<ServantRoster>('/api/admin/data?table=servant_rosters', ROSTER_KEY, toRosterModel, INITIAL_ROSTER),

  saveRoster: async (items: ServantRoster[]) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(ROSTER_KEY, JSON.stringify(items)); } catch {}
    }
    await writeViaApi('servant_rosters', items.map(toRosterDB));
  },

  deleteRoster: (id: string): Promise<boolean> =>
    deleteViaApi('servant_rosters', id),

  getInventory: (): Promise<InventoryItem[]> =>
    readViaApi<InventoryItem>('/api/admin/data?table=inventory_items', INVENTORY_KEY, toInventoryModel, INITIAL_INVENTORY),

  saveInventory: async (items: InventoryItem[]) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(INVENTORY_KEY, JSON.stringify(items)); } catch {}
    }
    await writeViaApi('inventory_items', items.map(toInventoryDB));
  },

  deleteInventory: (id: string): Promise<boolean> =>
    deleteViaApi('inventory_items', id),

  getSermons: (): Promise<Sermon[]> =>
    readViaApi<Sermon>('/api/admin/data?table=sermons', SERMONS_KEY, toSermonModel, INITIAL_SERMONS),

  saveSermons: async (items: Sermon[]) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(SERMONS_KEY, JSON.stringify(items)); } catch {}
    }
    await writeViaApi('sermons', items.map(toSermonDB));
  },

  deleteSermon: (id: string): Promise<boolean> =>
    deleteViaApi('sermons', id),

  getGallery: (): Promise<GalleryItem[]> =>
    readViaApi<GalleryItem>('/api/admin/data?table=gallery_items', GALLERY_KEY, toGalleryModel, INITIAL_GALLERY),

  saveGallery: async (items: GalleryItem[]) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(GALLERY_KEY, JSON.stringify(items)); } catch {}
    }
    await writeViaApi('gallery_items', items.map(toGalleryDB));
  },

  deleteGallery: (id: string): Promise<boolean> =>
    deleteViaApi('gallery_items', id),

  getMinistryRequests: (): Promise<MinistryRequest[]> =>
    readViaApi<MinistryRequest>('/api/admin/data?table=ministry_requests', REQUESTS_KEY, toRequestModel, INITIAL_MINISTRY_REQUESTS),

  updateMinistryRequests: async (items: MinistryRequest[]) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(REQUESTS_KEY, JSON.stringify(items)); } catch {}
    }
    await writeViaApi('ministry_requests', items.map(toRequestDB));
  },

  deleteMinistryRequest: (id: string): Promise<boolean> =>
    deleteViaApi('ministry_requests', id),
};

/**
 * Clean up private/admin cached records from localStorage and service worker caches
 * when an operator logs out from /admin, /super, or /kas.
 */
export function clearClientCachesOnLogout() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(REQUESTS_KEY);
    localStorage.removeItem(INVENTORY_KEY);
    localStorage.removeItem(ROSTER_KEY);
  } catch {}

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_API_CACHE' });
    }
    if ('caches' in window) {
      caches.delete('gia-v1-api').catch(() => {});
      caches.delete('gia-v2-api').catch(() => {});
    }
  } catch {}
}

