export type MinistryCategory = 'kidz' | 'youth' | 'hana' | 'general' | 'all';

export interface Announcement {
  id: string;
  title: string;
  category: MinistryCategory;
  content: string;
  eventDate: string; // ISO date string or YYYY-MM-DD
  endDate?: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  author?: string;
  badgeText?: string;
}

export interface ServantRole {
  category: MinistryCategory;
  roles: string[];
}

export interface ServantRoster {
  id: string;
  serviceCategory: 'kidz' | 'youth' | 'hana' | 'general';
  serviceDate: string; // YYYY-MM-DD
  role: string;
  servantName: string;
  phone?: string;
  status: 'confirmed' | 'pending' | 'replacement';
  notes?: string;
  createdAt: string;
}

export type InventoryCategory = 'Sound System' | 'Multimedia & Kamera' | 'Alat Musik' | 'Ibadah & Ruangan';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  code: string;
  quantity: number;
  isChecked: boolean;
  condition: 'good' | 'maintenance' | 'broken';
  location: string;
  lastCheckedAt?: string;
  checkedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  passage: string;
  date: string;
  youtubeUrl: string;
  thumbnail: string;
  category: string;
  createdAt?: string;
}

export type GalleryCategory = 'ibadah' | 'worship' | 'youth' | 'komunitas' | 'umum';

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  image: string;            // URL utama (R2 / Drive public thumbnail)
  thumbUrl?: string;        // URL thumbnail (R2 / Drive w800 thumbnail)
  driveFileId?: string;     // NEW: ID file di Google Drive (untuk sync & buka resolusi penuh)
  driveWebViewLink?: string;// NEW: Link "Lihat Resolusi Penuh" di Google Drive jemaat
  uploaderName?: string;    // NEW: Nama jemaat (kredit, mis. "Ibu Yuni")
  isPublished?: boolean;    // NEW: Flag tampil di galeri publik (default true)
  date: string;
  createdAt?: string;
}

export type MinistryRequestType = 'prayer' | 'sacrament' | 'komsel' | 'volunteer';

export interface MinistryRequest {
  id: string;
  type: MinistryRequestType;
  name: string;
  phone: string;
  subType?: string;
  message?: string;
  needPastoralVisit?: boolean;
  status: 'new' | 'in_progress' | 'completed' | 'pending' | 'contacted' | 'cancelled';
  createdAt: string;
}
