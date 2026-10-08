'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Announcement,
  ServantRoster,
  InventoryItem,
  MinistryCategory,
  InventoryCategory,
  Sermon,
  GalleryItem,
  MinistryRequest,
  MinistryRequestType
} from '@/types';
import { adminDataStore, clearClientCachesOnLogout } from '@/lib/storage';
import {
  Bell,
  Users,
  PackageCheck,
  Plus,
  Trash2,
  Edit2,
  Pin,
  Calendar,
  Search,
  CheckSquare,
  Square,
  Database,
  RefreshCw,
  Phone,
  LogOut,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  X,
  HeartHandshake,
  Video,
  Camera,
  Printer,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  Check,
  MessageSquare,
  Play,
  HardDrive,
  FolderOpen,
  Upload,
  Radio
} from 'lucide-react';
import { WhatsAppIcon, YouTubeIcon } from '@/components/Icons';
import UploadPhotoModal from '@/components/UploadPhotoModal';
import { useToast } from '@/components/admin/useToast';
import { useAdminData } from '@/components/admin/useAdminData';
import AnnouncementsTab from '@/components/admin/tabs/AnnouncementsTab';

type Role = 'super' | 'admin' | 'treasurer';

interface AuthUser {
  id: string;
  username: string;
  roles: Role[];
  display_name: string | null;
}

function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user?.roles?.some((r: string) => r === 'super' || r === 'admin')) {
          setUser(d.user);
        }
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Login gagal');
        return;
      }
      const roles: string[] = data.user?.roles || (data.user?.role ? [data.user.role] : []);
      if (!roles.some((r) => r === 'super' || r === 'admin')) {
        setAuthError('Akses ditolak. Halaman ini khusus admin/operator.');
        return;
      }
      setUser(data.user);
      setUsername('');
      setPassword('');
    } catch {
      setAuthError('Terjadi kesalahan koneksi');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
    } catch {
      /* ignore */
    }
    clearClientCachesOnLogout();
    setUser(null);
    setUsername('');
    setPassword('');
    setAuthError(null);
  };

  return {
    user,
    authChecked,
    username,
    setUsername,
    password,
    setPassword,
    authError,
    handleLogin,
    handleLogout,
  };
}

export default function AdminDashboard() {
  // Cross-tab infrastructure: auth, data, toast. See hooks/ for details.
  const {
    user: authUser,
    authChecked,
    username,
    setUsername,
    password,
    setPassword,
    authError,
    handleLogin,
    handleLogout,
  } = useCurrentUser();

  // Toast (placeholder — assigned after showToast is in scope below)
  const { showToast, ToastView } = useToast();

  // Tab & Data State
  const [activeTab, setActiveTab] = useState<'announcements' | 'roster' | 'requests' | 'media' | 'inventory'>('announcements');

  const {
    loading,
    loadAllData,
    announcements,
    setAnnouncements,
    roster,
    setRoster,
    inventory,
    setInventory,
    sermons,
    setSermons,
    gallery,
    setGallery,
    requests,
    setRequests,
  } = useAdminData(authUser !== null, showToast);

  // Announcement Form State
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState<{
    title: string;
    category: MinistryCategory;
    content: string;
    eventDate: string;
    isPinned: boolean;
    isPublished: boolean;
    badgeText: string;
    author: string;
  }>({
    title: '',
    category: 'general',
    content: '',
    eventDate: new Date().toISOString().split('T')[0],
    isPinned: false,
    isPublished: true,
    badgeText: 'Warta Baru',
    author: 'Sekretariat GIA Deliksari',
  });

  // Roster Category & Form State
  const [rosterCategoryTab, setRosterCategoryTab] = useState<'general' | 'youth' | 'kidz' | 'hana'>('general');
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState<string | null>(null);
  const [rosterForm, setRosterForm] = useState<{
    serviceCategory: 'general' | 'youth' | 'kidz' | 'hana';
    serviceDate: string;
    role: string;
    servantName: string;
    phone: string;
    status: 'confirmed' | 'pending' | 'replacement';
    notes: string;
  }>({
    serviceCategory: 'general',
    serviceDate: new Date().toISOString().split('T')[0],
    role: 'Worship Leader (WL)',
    servantName: '',
    phone: '',
    status: 'confirmed',
    notes: '',
  });

  // Broadcast & Print Modals
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Ministry Request Filter
  const [requestFilter, setRequestFilter] = useState<'all' | 'prayer' | 'sacrament' | 'komsel' | 'volunteer'>('all');

  // Media Subtab (Sermons vs Gallery)
  const [mediaSubTab, setMediaSubTab] = useState<'sermons' | 'gallery'>('sermons');
  
  // Sermon Modal
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [editingSermonId, setEditingSermonId] = useState<string | null>(null);
  const [sermonForm, setSermonForm] = useState<{
    title: string;
    speaker: string;
    passage: string;
    date: string;
    youtubeUrl: string;
    thumbnail: string;
    category: string;
  }>({
    title: '',
    speaker: 'Ps. Yohanes Sutono',
    passage: '',
    date: 'Minggu, 30 Agustus 2026',
    youtubeUrl: 'https://www.youtube.com/@GIADeliksariSemarang',
    thumbnail: '/images/logo.png',
    category: 'Ibadah Raya',
  });

  // Gallery Modal
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpen] = useState(false);
  const [isSyncingYouTube, setIsSyncingYouTube] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState<{
    title: string;
    category: 'ibadah' | 'worship' | 'youth' | 'komunitas' | 'umum';
    image: string;
    date: string;
  }>({
    title: '',
    category: 'ibadah',
    image: '/images/logo.png',
    date: 'Agustus 2026',
  });

  // Inventory Form & Filter State
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>('all');
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [invForm, setInvForm] = useState<{
    name: string;
    category: InventoryCategory;
    code: string;
    quantity: number;
    isChecked: boolean;
    condition: 'good' | 'maintenance' | 'broken';
    location: string;
    notes: string;
  }>({
    name: '',
    category: 'Sound System',
    code: '',
    quantity: 1,
    isChecked: true,
    condition: 'good',
    location: 'Meja Sound Operator',
    notes: '',
  });

  // Notification Toast — provided by useToast() hook above

  // Announcement Handlers
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Announcement[];
    if (editingAnnId) {
      updated = announcements.map((item) =>
        item.id === editingAnnId
          ? {
              ...item,
              ...annForm,
            }
          : item
      );
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        ...annForm,
        createdAt: new Date().toISOString(),
      };
      updated = [newAnn, ...announcements];
    }
    setAnnouncements(updated);
    const ok = await adminDataStore.saveAnnouncements(updated);
    if (!ok) {
      showToast('Gagal menyimpan warta ke database D1. Periksa koneksi/sesi.');
    } else {
      showToast(editingAnnId ? 'Warta Jemaat berhasil diperbarui' : 'Warta Jemaat baru berhasil diterbitkan');
    }
    setIsAnnModalOpen(false);
    setEditingAnnId(null);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus warta jemaat ini?')) {
      const ok = await adminDataStore.deleteAnnouncement(id);
      if (!ok) {
        showToast('Gagal menghapus warta jemaat dari database');
        return;
      }
      const updated = announcements.filter((item) => item.id !== id);
      setAnnouncements(updated);
      try { localStorage.setItem('gia_deliksari_announcements_v1', JSON.stringify(updated)); } catch {}
      showToast('Warta Jemaat berhasil dihapus');
    }
  };

  const handleTogglePinAnnouncement = async (item: Announcement) => {
    const updated = announcements.map((a) =>
      a.id === item.id ? { ...a, isPinned: !a.isPinned } : a
    );
    setAnnouncements(updated);
    const ok = await adminDataStore.saveAnnouncements(updated);
    if (!ok) {
      showToast('Gagal memperbarui status pin warta di database');
    } else {
      showToast(item.isPinned ? 'Pin warta dilepas' : 'Warta disematkan ke paling atas');
    }
  };

  // Roster Handlers
  const handleSaveRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: ServantRoster[];
    if (editingRosterId) {
      updated = roster.map((item) =>
        item.id === editingRosterId
          ? {
              ...item,
              ...rosterForm,
            }
          : item
      );
    } else {
      const newRoster: ServantRoster = {
        id: `rst-${Date.now()}`,
        ...rosterForm,
        createdAt: new Date().toISOString(),
      };
      updated = [...roster, newRoster];
    }
    setRoster(updated);
    const ok = await adminDataStore.saveRoster(updated);
    if (!ok) {
      showToast('Gagal menyimpan jadwal pelayan ke database D1');
    } else {
      showToast(editingRosterId ? 'Jadwal pelayan berhasil diperbarui' : 'Petugas ibadah baru berhasil ditambahkan');
    }
    setIsRosterModalOpen(false);
    setEditingRosterId(null);
  };

  const handleDeleteRoster = async (id: string) => {
    if (confirm('Hapus petugas pelayan ini dari roster?')) {
      const ok = await adminDataStore.deleteRoster(id);
      if (!ok) {
        showToast('Gagal menghapus petugas dari database');
        return;
      }
      const updated = roster.filter((item) => item.id !== id);
      setRoster(updated);
      try { localStorage.setItem('gia_deliksari_roster_v1', JSON.stringify(updated)); } catch {}
      showToast('Petugas berhasil dihapus dari jadwal');
    }
  };

  // Ministry Requests Handlers
  const handleUpdateRequestStatus = async (id: string, status: 'new' | 'in_progress' | 'completed') => {
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    setRequests(updated);
    const ok = await adminDataStore.updateMinistryRequests(updated);
    if (!ok) {
      showToast('Gagal memperbarui status permohonan di database D1');
    } else {
      showToast('Status permohonan berhasil diperbarui');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (confirm('Hapus riwayat permohonan jemaat ini?')) {
      const ok = await adminDataStore.deleteMinistryRequest(id);
      if (!ok) {
        showToast('Gagal menghapus permohonan dari database');
        return;
      }
      const updated = requests.filter(r => r.id !== id);
      setRequests(updated);
      try { localStorage.setItem('gia_deliksari_requests_v1', JSON.stringify(updated)); } catch {}
      showToast('Permohonan berhasil dihapus');
    }
  };

  // Sermon Handlers
  const handleSaveSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Sermon[];
    if (editingSermonId) {
      updated = sermons.map((s) => s.id === editingSermonId ? { ...s, ...sermonForm } : s);
    } else {
      const newSermon: Sermon = {
        id: `srm-${Date.now()}`,
        ...sermonForm,
        createdAt: new Date().toISOString(),
      };
      updated = [newSermon, ...sermons];
    }
    setSermons(updated);
    const ok = await adminDataStore.saveSermons(updated);
    if (!ok) {
      showToast('Gagal menyimpan khotbah ke database D1');
    } else {
      showToast(editingSermonId ? 'Khotbah berhasil diperbarui' : 'Khotbah baru berhasil ditambahkan');
    }
    setIsSermonModalOpen(false);
    setEditingSermonId(null);
  };

  const handleDeleteSermon = async (id: string) => {
    if (confirm('Hapus arsip khotbah ini?')) {
      const ok = await adminDataStore.deleteSermon(id);
      if (!ok) {
        showToast('Gagal menghapus khotbah dari database');
        return;
      }
      const updated = sermons.filter(s => s.id !== id);
      setSermons(updated);
      try { localStorage.setItem('gia_deliksari_sermons_v1', JSON.stringify(updated)); } catch {}
      showToast('Khotbah berhasil dihapus');
    }
  };

  const handleSyncYouTube = async () => {
    setIsSyncingYouTube(true);
    try {
      const res = await fetch('/api/youtube/latest');
      const data = await res.json();
      if (data.sermons && data.sermons.length > 0) {
        // MERGE, not replace: keep manually curated sermons (srm-* ids),
        // upsert YouTube items by their stable yt id, newest first.
        const incoming: Sermon[] = data.sermons;
        const manual = sermons.filter((s) => !incoming.some((v) => v.id === s.id));
        const merged = [...incoming, ...manual].sort(
          (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
        );
        setSermons(merged);
        const ok = await adminDataStore.saveSermons(merged);
        if (!ok) {
          showToast('Video diterima, tapi gagal menyimpan ke database D1');
        } else if (data.source === 'youtube_api') {
          showToast(`Sinkronisasi ${incoming.length} video terbaru — khotbah manual tetap aman`);
        } else {
          showToast('Sinkronisasi selesai (menggunakan data cadangan/kurasi)');
        }
      }
    } catch (err) {
      showToast('Gagal sinkronisasi YouTube Data API');
    } finally {
      setIsSyncingYouTube(false);
    }
  };

  // Gallery Handlers
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: GalleryItem[];
    if (editingGalleryId) {
      updated = gallery.map((g) => g.id === editingGalleryId ? { ...g, ...galleryForm } : g);
    } else {
      const newGal: GalleryItem = {
        id: `gal-${Date.now()}`,
        ...galleryForm,
        createdAt: new Date().toISOString(),
      };
      updated = [newGal, ...gallery];
    }
    setGallery(updated);
    const ok = await adminDataStore.saveGallery(updated);
    if (!ok) {
      showToast('Gagal menyimpan foto ke database D1');
    } else {
      showToast(editingGalleryId ? 'Foto galeri berhasil diperbarui' : 'Foto galeri berhasil ditambahkan');
    }
    setIsGalleryModalOpen(false);
    setEditingGalleryId(null);
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm('Hapus foto ini dari galeri?')) {
      const ok = await adminDataStore.deleteGallery(id);
      if (!ok) {
        showToast('Gagal menghapus foto dari database');
        return;
      }
      const updated = gallery.filter(g => g.id !== id);
      setGallery(updated);
      try { localStorage.setItem('gia_deliksari_gallery_v1', JSON.stringify(updated)); } catch {}
      showToast('Foto galeri berhasil dihapus');
    }
  };

  // Inventory Handlers
  const handleToggleInventoryCheck = async (item: InventoryItem) => {
    const updated = inventory.map((inv) =>
      inv.id === item.id
        ? {
            ...inv,
            isChecked: !inv.isChecked,
            lastCheckedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            checkedBy: 'Majelis Admin',
          }
        : inv
    );
    setInventory(updated);
    const ok = await adminDataStore.saveInventory(updated);
    if (!ok) {
      showToast('Gagal menyimpan status checklist ke database D1');
    }
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: InventoryItem[];
    if (editingInvId) {
      updated = inventory.map((inv) =>
        inv.id === editingInvId
          ? {
              ...inv,
              ...invForm,
              lastCheckedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : inv
      );
    } else {
      const newInv: InventoryItem = {
        id: `inv-${Date.now()}`,
        ...invForm,
        createdAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        checkedBy: 'Majelis Admin',
      };
      updated = [...inventory, newInv];
    }
    setInventory(updated);
    const ok = await adminDataStore.saveInventory(updated);
    if (!ok) {
      showToast('Gagal menyimpan data barang ke database D1');
    } else {
      showToast(editingInvId ? 'Data barang inventaris berhasil diupdate' : 'Barang inventaris baru berhasil ditambahkan');
    }
    setIsInvModalOpen(false);
    setEditingInvId(null);
  };

  const handleDeleteInventory = async (id: string) => {
    if (confirm('Hapus barang ini dari daftar inventaris gereja?')) {
      const ok = await adminDataStore.deleteInventory(id);
      if (!ok) {
        showToast('Gagal menghapus barang inventaris dari database');
        return;
      }
      const updated = inventory.filter((inv) => inv.id !== id);
      setInventory(updated);
      try { localStorage.setItem('gia_deliksari_inventory_v1', JSON.stringify(updated)); } catch {}
      showToast('Barang inventaris berhasil dihapus');
    }
  };

  // Helper Badge Color
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'general':
      case 'ibadah':
        return 'bg-[#FBF1F2] text-[#8B1E28] border-[#E8C2C5] dark:bg-[#261517] dark:text-[#E88086] dark:border-[#52252A]';
      case 'youth':
        return 'bg-[#F9FAFB] text-[#475569] border-[#E5E7EB] dark:bg-[#1E293B] dark:text-[#64748B] dark:border-[#334155]';
      case 'kidz':
      case 'worship':
        return 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A]';
      case 'hana':
      case 'komunitas':
        return 'bg-[#FAF5FF] text-[#6D28D9] border-[#E9D5FF] dark:bg-[#2E1065] dark:text-[#A78BFA] dark:border-[#4C1D95]';
      default:
        return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A]';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'general': return 'Ibadah Raya';
      case 'youth': return 'Grow Youth (PRBK)';
      case 'kidz': return 'COC Kidz (Sekolah Minggu)';
      case 'hana': return 'Wanita Hana & Komsel';
      case 'all': return 'Umum / Semua';
      default: return cat;
    }
  };

  // Generate Broadcast WhatsApp text for Roster
  const currentCategoryRoster = roster.filter(r => r.serviceCategory === rosterCategoryTab);
  const broadcastText = `*JADWAL PELAYANAN ${getCategoryLabel(rosterCategoryTab).toUpperCase()}*\n*GIA Deliksari Semarang*\n\n` +
    currentCategoryRoster.map((r, i) => `${i + 1}. *${r.role}*: ${r.servantName} (${r.status === 'confirmed' ? '✅ Siap' : r.status === 'replacement' ? '⚠️ Pengganti' : '⏳ Menunggu'})\n${r.notes ? `   _Catatan: ${r.notes}_\n` : ''}`).join('\n') +
    `\n_Mari melayani dengan sukacita bagi kemuliaan Kristus. Tuhan Yesus memberkati!_`;

  // Filtered requests
  const filteredRequests = requestFilter === 'all' 
    ? requests 
    : requests.filter(r => r.type === requestFilter);

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!authChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FFFFFF] dark:bg-[#0F1115]">
        <div className="animate-pulse text-[#6B7280] dark:text-[#9CA3AF]">Memuat…</div>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="min-h-screen bg-[#FFFFFF] dark:bg-[#0F1115] text-[#111827] dark:text-[#F9FAFB] flex flex-col justify-between selection:bg-[#8B1E28] selection:text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-20 relative overflow-hidden">
          {/* Subtle Maroon Glow */}

          <div className="w-full max-w-md bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-xl p-8 sm:p-10 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#8B1E28] dark:bg-[#B8323D] text-white flex items-center justify-center mx-auto shadow-md">
                <KeyRound className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                Portal Majelis & Admin
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                Kelola warta jemaat, plotting pelayan, permohonan doa, media khotbah, dan inventaris GIA Deliksari.
              </p>
            </div>

            {authError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-bold leading-snug animate-shake">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] uppercase tracking-wider">
                  Nama Pengguna
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nama pengurus"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-[#111827] dark:text-[#F9FAFB] text-sm focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30 focus:border-[#8B1E28] dark:focus:border-[#B8323D] outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] uppercase tracking-wider">
                  Kata Sandi Pengurus
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-[#111827] dark:text-[#F9FAFB] text-sm focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30 focus:border-[#8B1E28] dark:focus:border-[#B8323D] outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white font-extrabold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk ke Dashboard</span>
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#8B1E28] dark:text-[#E88086] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Beranda Jemaat</span>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // ----------------------------------------------------
  // MAIN ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <main className="min-h-screen bg-[#FFFFFF] dark:bg-[#0F1115] text-[#111827] dark:text-[#F9FAFB] flex flex-col justify-between selection:bg-[#8B1E28] selection:text-white">
      <Navbar />

      {/* Toast Notification (rendered by useToast hook) */}
      {ToastView}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FBF1F2] dark:bg-[#261517] text-[#8B1E28] dark:text-[#E88086] border border-[#E8C2C5] dark:border-[#52252A]">
                Majelis & Pastoral Portal
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                <Database className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
                <span>Cloudflare D1 Database</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Pusat Manajemen Pelayanan
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={loadAllData}
              title="Refresh Data"
              className="p-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 text-[#8B1E28] dark:text-[#E88086] ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              href="/home"
              className="px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors text-xs font-bold flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
              <span>Lihat Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-[#171A21] hover:bg-[#F3F4F6] dark:hover:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors text-xs font-bold flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* 5 Main Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 p-2 bg-[#F3F4F6] dark:bg-[#171A21] rounded-3xl border border-[#E5E7EB] dark:border-[#2A2F3A]">
          {[
            { id: 'announcements', label: 'Warta Jemaat', count: announcements.length, icon: Bell },
            { id: 'roster', label: 'Roster Pelayanan', count: roster.length, icon: Users },
            { id: 'requests', label: 'Layanan Jemaat', count: requests.filter(r => r.status === 'new').length, badge: 'Baru', icon: HeartHandshake },
            { id: 'media', label: 'CMS Khotbah & Galeri', count: sermons.length + gallery.length, icon: Video },
            { id: 'inventory', label: 'Inventaris & Cek', count: inventory.length, icon: PackageCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white shadow-md'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-white/60 dark:hover:bg-[#1F232D]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#E5E7EB] dark:bg-[#2A2F3A] text-[#111827] dark:text-[#F9FAFB]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: WARTA JEMAAT */}
        {/* ========================================================================= */}
        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            onCreate={() => {
              setEditingAnnId(null);
              setAnnForm({
                title: '',
                category: 'general',
                content: '',
                eventDate: new Date().toISOString().split('T')[0],
                isPinned: false,
                isPublished: true,
                badgeText: 'Warta Baru',
                author: 'Sekretariat GIA Deliksari',
              });
              setIsAnnModalOpen(true);
            }}
            onEdit={(item) => {
              setEditingAnnId(item.id);
              setAnnForm({
                title: item.title,
                category: item.category,
                content: item.content,
                eventDate: item.eventDate,
                isPinned: item.isPinned,
                isPublished: item.isPublished,
                badgeText: item.badgeText || '',
                author: item.author || 'Sekretariat GIA Deliksari',
              });
              setIsAnnModalOpen(true);
            }}
            onTogglePin={handleTogglePinAnnouncement}
            onDelete={handleDeleteAnnouncement}
            getCategoryLabel={getCategoryLabel}
            getCategoryBadgeClass={getCategoryBadgeClass}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ROSTER PELAYANAN (DENGAN CETAK JADWAL & BROADCAST WA) */}
        {/* ========================================================================= */}
        {activeTab === 'roster' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
                  Plotting & Jadwal Pelayan Ibadah Mingguan
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Kelola nama pelayan, status konfirmasi tugas, dan broadcast pengingat WhatsApp.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-[#8B1E28] dark:text-[#E88086]" />
                  <span>Cetak / Export Jadwal</span>
                </button>

                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-[#F9FAFB] dark:bg-[#1F232D] text-[#4B5563] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2F3A] text-xs font-bold flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Broadcast WA Pelayan</span>
                </button>

                <button
                  onClick={() => {
                    setEditingRosterId(null);
                    setRosterForm({
                      serviceCategory: rosterCategoryTab,
                      serviceDate: new Date().toISOString().split('T')[0],
                      role: 'Worship Leader (WL)',
                      servantName: '',
                      phone: '',
                      status: 'confirmed',
                      notes: '',
                    });
                    setIsRosterModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Petugas</span>
                </button>
              </div>
            </div>

            {/* 4 Community Tabs for Roster */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#F3F4F6] dark:bg-[#171A21] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2F3A]">
              {[
                { id: 'general', label: '1. Ibadah Raya (Umum)' },
                { id: 'youth', label: '2. Grow Generation (Youth)' },
                { id: 'kidz', label: '3. COC Kidz (Sekolah Minggu)' },
                { id: 'hana', label: '4. Wanita Hana & Komsel' },
              ].map((cTab) => {
                const isActive = rosterCategoryTab === cTab.id;
                return (
                  <button
                    key={cTab.id}
                    onClick={() => setRosterCategoryTab(cTab.id as any)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      isActive
                        ? 'bg-white dark:bg-[#1F232D] text-[#8B1E28] dark:text-[#E88086] shadow-sm border border-[#E5E7EB] dark:border-[#2A2F3A]'
                        : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-white/40'
                    }`}
                  >
                    {cTab.label}
                  </button>
                );
              })}
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] border-b border-[#E5E7EB] dark:border-[#2A2F3A]">
                  <tr>
                    <th className="p-4 font-bold">Peran / Tugas</th>
                    <th className="p-4 font-bold">Nama Pelayan</th>
                    <th className="p-4 font-bold">Tanggal Ibadah</th>
                    <th className="p-4 font-bold">Status Kesiapan</th>
                    <th className="p-4 font-bold">Catatan</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2F3A]">
                  {currentCategoryRoster.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        Belum ada petugas terjadwal untuk kategori ini. Klik "Tambah Petugas" di atas.
                      </td>
                    </tr>
                  ) : (
                    currentCategoryRoster.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FFFFFF] dark:hover:bg-[#261317] transition-colors">
                        <td className="p-4 font-bold text-[#111827] dark:text-white">
                          {item.role}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#111827] dark:text-[#F9FAFB]">{item.servantName}</div>
                          {item.phone && (
                            <a
                              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#8B1E28] dark:text-[#E88086] hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{item.phone}</span>
                            </a>
                          )}
                        </td>
                        <td className="p-4 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          {item.serviceDate}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${
                              item.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                : item.status === 'replacement'
                                ? 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A]'
                                : 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A]'
                            }`}
                          >
                            {item.status === 'confirmed' ? 'Siap Melayani' : item.status === 'replacement' ? 'Perlu Pengganti' : 'Menunggu Konfirmasi'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#6B7280] dark:text-[#9CA3AF] max-w-xs truncate">
                          {item.notes || '-'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingRosterId(item.id);
                                setRosterForm({
                                  serviceCategory: item.serviceCategory,
                                  serviceDate: item.serviceDate,
                                  role: item.role,
                                  servantName: item.servantName,
                                  phone: item.phone || '',
                                  status: item.status,
                                  notes: item.notes || '',
                                });
                                setIsRosterModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A]"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoster(item.id)}
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LAYANAN & PERMOHONAN JEMAAT */}
        {/* ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
                  Permohonan Jemaat & Formulir Masuk
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Daftar jemaat yang mengajukan pokok doa, pendaftaran baptisan, komsel, dan kerinduan melayani.
                </p>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Semua Permohonan' },
                  { id: 'prayer', label: 'Doa & Konseling' },
                  { id: 'sacrament', label: 'Sakramen Baptis' },
                  { id: 'komsel', label: 'Komsel Ekklesia' },
                  { id: 'volunteer', label: 'Volunteer Pelayan' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRequestFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      requestFilter === f.id
                        ? 'bg-[#8B1E28] dark:bg-[#B8323D] text-white shadow-sm'
                        : 'bg-white dark:bg-[#171A21] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2F3A]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.length === 0 ? (
                <div className="col-span-2 p-12 text-center rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] space-y-2">
                  <HeartHandshake className="w-10 h-10 text-[#8B1E28] dark:text-[#E88086] mx-auto opacity-60" />
                  <h3 className="font-bold text-base text-[#111827] dark:text-white">Belum Ada Permohonan Masuk</h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Formulir yang diisi jemaat di website akan otomatis muncul di sini.</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm space-y-4 hover:border-[#8B1E28]/40 dark:hover:border-[#B8323D]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            req.type === 'prayer' ? 'bg-[#FBF1F2] text-[#8B1E28] border-[#E8C2C5] dark:bg-[#261517] dark:text-[#E88086] dark:border-[#52252A]' :
                            req.type === 'sacrament' ? 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A]' :
                            req.type === 'komsel' ? 'bg-[#FAF5FF] text-[#6D28D9] border-[#E9D5FF] dark:bg-[#2E1065] dark:text-[#A78BFA] dark:border-[#4C1D95]' :
                            'bg-[#F9FAFB] text-[#475569] border-[#E5E7EB] dark:bg-[#1E293B] dark:text-[#64748B] dark:border-[#334155]'
                          }`}>
                            {req.type === 'prayer' ? 'Doa & Konseling' : req.type === 'sacrament' ? 'Sakramen' : req.type === 'komsel' ? 'Komsel' : 'Volunteer'}
                          </span>
                          <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                            {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-[#111827] dark:text-white">{req.name}</h3>
                        <p className="text-xs font-bold text-[#8B1E28] dark:text-[#E88086]">{req.subType}</p>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value as any)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1 outline-none border cursor-pointer ${
                          req.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : req.status === 'in_progress'
                            ? 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF]'
                            : 'bg-[#FBF1F2] text-[#8B1E28] border-[#E8C2C5] dark:bg-[#261517] dark:text-[#E88086] dark:border-[#52252A]'
                        }`}
                      >
                        <option value="new">🔴 Baru Masuk</option>
                        <option value="in_progress">🟡 Sedang Diproses</option>
                        <option value="completed">🟢 Selesai Dilayani</option>
                      </select>
                    </div>

                    {req.message && (
                      <div className="p-3.5 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                        "{req.message}"
                      </div>
                    )}

                    {req.needPastoralVisit && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E28] dark:text-[#E88086]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Memohon Kunjungan Doa Hari Selasa</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E5E7EB] dark:border-[#2A2F3A]">
                      <a
                        href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Syalom ${req.name}, kami dari Tim Pastoral GIA Deliksari menindaklanjuti permohonan Anda...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                        <span>Hubungi WhatsApp</span>
                      </a>

                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-2 rounded-xl text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                        title="Hapus Permohonan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CMS KHOTBAH & GALERI FOTO */}
        {/* ========================================================================= */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Sub-tab toggle & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 p-1.5 bg-[#F3F4F6] dark:bg-[#171A21] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2F3A] w-fit">
                <button
                  onClick={() => setMediaSubTab('sermons')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    mediaSubTab === 'sermons'
                      ? 'bg-[#8B1E28] dark:bg-[#B8323D] text-white shadow-sm'
                      : 'text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Arsip Khotbah ({sermons.length})</span>
                </button>
                <button
                  onClick={() => setMediaSubTab('gallery')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    mediaSubTab === 'gallery'
                      ? 'bg-[#8B1E28] dark:bg-[#B8323D] text-white shadow-sm'
                      : 'text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Galeri Dokumentasi ({gallery.length})</span>
                </button>
              </div>

              {mediaSubTab === 'sermons' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSyncYouTube}
                    disabled={isSyncingYouTube}
                    className="px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] hover:bg-[#E5E7EB] dark:hover:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#2A2F3A] text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086] ${isSyncingYouTube ? 'animate-spin' : ''}`} />
                    <span>{isSyncingYouTube ? 'Sinkronisasi...' : 'Tarik dari YouTube Data API'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingSermonId(null);
                      setSermonForm({
                        title: '',
                        speaker: 'Ps. Yohanes Sutono',
                        passage: '',
                        date: 'Minggu, 30 Agustus 2026',
                        youtubeUrl: 'https://www.youtube.com/@GIADeliksariSemarang',
                        thumbnail: '/images/logo.png',
                        category: 'Ibadah Raya',
                      });
                      setIsSermonModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Khotbah Manual</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={process.env.NEXT_PUBLIC_GOOGLE_DRIVE_GALLERY_URL || "https://drive.google.com/drive/folders/1T_ahqCtmOjdFl0L-MNu7bIQo-8Oz8y9h"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] hover:bg-[#E5E7EB] dark:hover:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#2A2F3A] text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#4B5563]" />
                    <span>Arsip Google Drive</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>

                  <button
                    onClick={() => setIsUploadPhotoModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Foto ke Cloud</span>
                  </button>
                </div>
              )}
            </div>

            {/* Storage Info Banner */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] flex items-center justify-between gap-3 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Arsitektur Hybrid Rolling Storage</strong>: Master foto diarsipkan selamanya di Google Drive. Galeri web menyimpan 50 foto terkini secara instan &amp; hemat kuota (di bawah 100 MB).
                </span>
              </div>
            </div>

            {/* Sermons CMS List */}
            {mediaSubTab === 'sermons' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sermons.map((sermon) => (
                  <div
                    key={sermon.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FBF1F2] text-[#8B1E28] border border-[#E8C2C5] dark:bg-[#261517] dark:text-[#E88086] dark:border-[#52252A]">
                        {sermon.category}
                      </span>
                      <h3 className="text-base font-extrabold text-[#111827] dark:text-white leading-snug">
                        {sermon.title}
                      </h3>
                      <p className="text-xs font-bold text-[#8B1E28] dark:text-[#E88086]">{sermon.speaker}</p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{sermon.passage}</p>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{sermon.date}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2F3A] flex items-center justify-between gap-2">
                      <a
                        href={sermon.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#8B1E28] dark:text-[#E88086] flex items-center gap-1 hover:underline"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Link YouTube</span>
                      </a>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingSermonId(sermon.id);
                            setSermonForm({
                              title: sermon.title,
                              speaker: sermon.speaker,
                              passage: sermon.passage,
                              date: sermon.date,
                              youtubeUrl: sermon.youtubeUrl,
                              thumbnail: sermon.thumbnail,
                              category: sermon.category,
                            });
                            setIsSermonModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#2A2F3A]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSermon(sermon.id)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery CMS List */}
            {mediaSubTab === 'gallery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] w-full bg-[#F3F4F6] dark:bg-[#1F232D]">
                      <Image
                        src={item.image || '/images/logo.png'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#8B1E28] dark:bg-[#B8323D]/10 text-[#8B1E28] dark:text-[#E88086] border border-[#8B1E28]/20">
                        {item.category.toUpperCase()} • {item.date}
                      </span>
                      <h4 className="text-sm font-bold text-[#111827] dark:text-white leading-snug">{item.title}</h4>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingGalleryId(item.id);
                          setGalleryForm({
                            title: item.title,
                            category: item.category,
                            image: item.image,
                            date: item.date,
                          });
                          setIsGalleryModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#2A2F3A]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(item.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INVENTARIS & CHECKLIST OPERASIONAL */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
                  Inventaris & Checklist Alat Ibadah
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Checklist sound system, multimedia, instrumen musik, dan fasilitas ruangan sebelum ibadah dimulai.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingInvId(null);
                  setInvForm({
                    name: '',
                    category: 'Sound System',
                    code: '',
                    quantity: 1,
                    isChecked: true,
                    condition: 'good',
                    location: 'Meja Sound Operator',
                    notes: '',
                  });
                  setIsInvModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Barang</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {['all', 'Sound System', 'Multimedia & Kamera', 'Alat Musik', 'Ibadah & Ruangan'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInvCategoryFilter(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      invCategoryFilter === cat
                        ? 'bg-[#8B1E28] dark:bg-[#B8323D] text-white shadow-sm'
                        : 'bg-white dark:bg-[#171A21] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A]'
                    }`}
                  >
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kode / nama barang..."
                  value={invSearchQuery}
                  onChange={(e) => setInvSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] text-xs text-[#111827] dark:text-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30"
                />
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] border-b border-[#E5E7EB] dark:border-[#2A2F3A]">
                  <tr>
                    <th className="p-4 font-bold">Checklist</th>
                    <th className="p-4 font-bold">Nama & Kode Barang</th>
                    <th className="p-4 font-bold">Kategori & Lokasi</th>
                    <th className="p-4 font-bold">Kondisi</th>
                    <th className="p-4 font-bold">Pemeriksaan Terakhir</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2F3A]">
                  {inventory
                    .filter((inv) =>
                      (invCategoryFilter === 'all' || inv.category === invCategoryFilter) &&
                      (inv.name.toLowerCase().includes(invSearchQuery.toLowerCase()) ||
                        inv.code.toLowerCase().includes(invSearchQuery.toLowerCase()))
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#FFFFFF] dark:hover:bg-[#261317] transition-colors">
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleInventoryCheck(item)}
                            className="p-1 rounded-lg text-[#8B1E28] dark:text-[#E88086] hover:bg-[#F3F4F6] dark:hover:bg-[#1F232D] transition-colors"
                          >
                            {item.isChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-stone-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#111827] dark:text-white">{item.name}</div>
                          <div className="text-xs text-stone-500 font-mono">Kode: {item.code} • Jml: {item.quantity} unit</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3F4F6] text-[#6B7280] dark:bg-[#1F232D] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2F3A] inline-block mb-1">
                            {item.category}
                          </span>
                          <div className="text-xs text-stone-500">{item.location}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${
                              item.condition === 'good'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : item.condition === 'maintenance'
                                ? 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF]'
                                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}
                          >
                            {item.condition === 'good' ? 'Baik / Normal' : item.condition === 'maintenance' ? 'Perlu Pengecekan' : 'Rusak / Servis'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-stone-500">
                          {item.lastCheckedAt || '-'}
                          {item.checkedBy && <div className="text-[10px] text-stone-400">oleh: {item.checkedBy}</div>}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingInvId(item.id);
                                setInvForm({
                                  name: item.name,
                                  category: item.category,
                                  code: item.code,
                                  quantity: item.quantity,
                                  isChecked: item.isChecked,
                                  condition: item.condition,
                                  location: item.location,
                                  notes: item.notes || '',
                                });
                                setIsInvModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInventory(item.id)}
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL: ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">
                {editingAnnId ? 'Edit Warta Jemaat' : 'Tambah Warta Jemaat Baru'}
              </h3>
              <button onClick={() => setIsAnnModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Judul Warta *</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="Contoh: Ibadah Padang Pemuda & Remaja"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Kategori Komunitas *</label>
                  <select
                    value={annForm.category}
                    onChange={(e) => setAnnForm({ ...annForm, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  >
                    <option value="general">Ibadah Raya / Umum</option>
                    <option value="youth">Grow Generation (Youth)</option>
                    <option value="kidz">COC Kidz (Sekolah Minggu)</option>
                    <option value="hana">Wanita Hana & Komsel</option>
                    <option value="all">Semua Komunitas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Tanggal Kegiatan *</label>
                  <input
                    type="date"
                    required
                    value={annForm.eventDate}
                    onChange={(e) => setAnnForm({ ...annForm, eventDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Isi / Deskripsi Warta *</label>
                <textarea
                  rows={4}
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  placeholder="Tuliskan detail pengumuman warta jemaat..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Badge Label Teks</label>
                  <input
                    type="text"
                    value={annForm.badgeText}
                    onChange={(e) => setAnnForm({ ...annForm, badgeText: e.target.value })}
                    placeholder="Contoh: Khusus, Penting, Youth Event"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Penulis / Unit Pelayanan</label>
                  <input
                    type="text"
                    value={annForm.author}
                    onChange={(e) => setAnnForm({ ...annForm, author: e.target.value })}
                    placeholder="Sekretariat GIA Deliksari"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">
                  <input
                    type="checkbox"
                    checked={annForm.isPinned}
                    onChange={(e) => setAnnForm({ ...annForm, isPinned: e.target.checked })}
                    className="rounded text-[#8B1E28] dark:text-[#E88086] focus:ring-[#8B1E28] dark:focus:ring-[#B8323D]"
                  />
                  <span>Sematkan ke Paling Atas (Pinned)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">
                  <input
                    type="checkbox"
                    checked={annForm.isPublished}
                    onChange={(e) => setAnnForm({ ...annForm, isPublished: e.target.checked })}
                    className="rounded text-[#8B1E28] dark:text-[#E88086] focus:ring-[#8B1E28] dark:focus:ring-[#B8323D]"
                  />
                  <span>Tayangkan Langsung (Publish)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold shadow-md"
                >
                  Simpan Warta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ROSTER PELAYAN */}
      {/* ========================================================================= */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">
                {editingRosterId ? 'Edit Petugas Ibadah' : 'Tambah Petugas Ibadah'}
              </h3>
              <button onClick={() => setIsRosterModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoster} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Kategori Ibadah *</label>
                <select
                  value={rosterForm.serviceCategory}
                  onChange={(e) => setRosterForm({ ...rosterForm, serviceCategory: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                >
                  <option value="general">Ibadah Raya (Umum)</option>
                  <option value="youth">Grow Generation (Youth)</option>
                  <option value="kidz">COC Kidz (Sekolah Minggu)</option>
                  <option value="hana">Wanita Hana & Komsel</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Tugas / Role *</label>
                  <input
                    type="text"
                    required
                    value={rosterForm.role}
                    onChange={(e) => setRosterForm({ ...rosterForm, role: e.target.value })}
                    placeholder="Worship Leader, Pemain Musik, Usher"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Tanggal Ibadah *</label>
                  <input
                    type="date"
                    required
                    value={rosterForm.serviceDate}
                    onChange={(e) => setRosterForm({ ...rosterForm, serviceDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Nama Pelayan *</label>
                <input
                  type="text"
                  required
                  value={rosterForm.servantName}
                  onChange={(e) => setRosterForm({ ...rosterForm, servantName: e.target.value })}
                  placeholder="Nama lengkap pelayan / nama tim..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={rosterForm.phone}
                    onChange={(e) => setRosterForm({ ...rosterForm, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Status Kesiapan *</label>
                  <select
                    value={rosterForm.status}
                    onChange={(e) => setRosterForm({ ...rosterForm, status: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  >
                    <option value="confirmed">🟢 Siap Melayani</option>
                    <option value="pending">⏳ Menunggu Konfirmasi</option>
                    <option value="replacement">🟡 Perlu Pengganti</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Catatan Teknis / Lagu</label>
                <textarea
                  rows={2}
                  value={rosterForm.notes}
                  onChange={(e) => setRosterForm({ ...rosterForm, notes: e.target.value })}
                  placeholder="Jadwal soundcheck, briefing, atau tema..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold shadow-md"
                >
                  Simpan Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BROADCAST WHATSAPP PELAYAN */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#8B1E28] dark:text-[#E88086]" />
                <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">
                  Template Broadcast WhatsApp
                </h3>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Salin pesan di bawah ini untuk dibagikan ke grup WhatsApp pelayan atau kirim pengingat tugas mingguan.
            </p>

            <div className="p-4 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-xs font-mono text-[#111827] dark:text-[#F9FAFB] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {broadcastText}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(broadcastText);
                  showToast('Teks broadcast berhasil disalin ke clipboard!');
                  setIsBroadcastModalOpen(false);
                }}
                className="px-5 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold flex items-center gap-2 shadow-md"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Teks Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CETAK / EXPORT JADWAL MINGGUAN */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white text-stone-900 rounded-2xl shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#8B1E28] dark:text-[#E88086]">
                  Jadwal Petugas Pelayanan GIA Deliksari
                </h3>
                <p className="text-xs text-stone-500">
                  Format Siap Cetak A4 / Papan Pengumuman Gereja
                </p>
              </div>
              <button onClick={() => setIsPrintModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-roster" className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-stone-50 border text-center space-y-1">
                <h4 className="font-extrabold text-base uppercase tracking-wider">{getCategoryLabel(rosterCategoryTab)}</h4>
                <p className="text-stone-600 text-xs">GIA Deliksari — "Growing Church!" • Jl. Deliksari Gunungpati Semarang</p>
              </div>

              <table className="w-full text-left border-collapse border border-stone-200">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="p-3 border border-stone-200 font-bold">No</th>
                    <th className="p-3 border border-stone-200 font-bold">Peran / Tugas</th>
                    <th className="p-3 border border-stone-200 font-bold">Nama Petugas</th>
                    <th className="p-3 border border-stone-200 font-bold">Kesiapan</th>
                    <th className="p-3 border border-stone-200 font-bold">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategoryRoster.map((r, idx) => (
                    <tr key={r.id} className="border border-stone-200">
                      <td className="p-3 border border-stone-200 text-center">{idx + 1}</td>
                      <td className="p-3 border border-stone-200 font-bold">{r.role}</td>
                      <td className="p-3 border border-stone-200">{r.servantName}</td>
                      <td className="p-3 border border-stone-200">{r.status === 'confirmed' ? 'Siap' : r.status === 'replacement' ? 'Pengganti' : 'Menunggu'}</td>
                      <td className="p-3 border border-stone-200 text-stone-500">{r.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-[#8B1E28] dark:bg-[#B8323D] text-white text-xs font-bold flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Jadwal (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KHOTBAH */}
      {/* ========================================================================= */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">
                {editingSermonId ? 'Edit Arsip Khotbah' : 'Tambah Khotbah Baru'}
              </h3>
              <button onClick={() => setIsSermonModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSermon} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Judul Khotbah *</label>
                <input
                  type="text"
                  required
                  value={sermonForm.title}
                  onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                  placeholder="Contoh: Bertumbuh Kuat di Tengah Badai"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Pengkhotbah *</label>
                  <input
                    type="text"
                    required
                    value={sermonForm.speaker}
                    onChange={(e) => setSermonForm({ ...sermonForm, speaker: e.target.value })}
                    placeholder="Ps. Yohanes Sutono"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Ayat Alkitab *</label>
                  <input
                    type="text"
                    required
                    value={sermonForm.passage}
                    onChange={(e) => setSermonForm({ ...sermonForm, passage: e.target.value })}
                    placeholder="Kolose 2:6-7"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Tanggal Ibadah</label>
                  <input
                    type="text"
                    value={sermonForm.date}
                    onChange={(e) => setSermonForm({ ...sermonForm, date: e.target.value })}
                    placeholder="Minggu, 30 Agustus 2026"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Kategori Ibadah</label>
                  <select
                    value={sermonForm.category}
                    onChange={(e) => setSermonForm({ ...sermonForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  >
                    <option value="Ibadah Raya">Ibadah Raya</option>
                    <option value="Grow Generation Youth">Grow Generation Youth</option>
                    <option value="Wanita Hana">Wanita Hana</option>
                    <option value="Doa Malam">Doa Malam</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Link Video YouTube *</label>
                <input
                  type="url"
                  required
                  value={sermonForm.youtubeUrl}
                  onChange={(e) => setSermonForm({ ...sermonForm, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSermonModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold shadow-md"
                >
                  Simpan Khotbah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GALERI FOTO */}
      {/* ========================================================================= */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">
                {editingGalleryId ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}
              </h3>
              <button onClick={() => setIsGalleryModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Judul / Keterangan Foto *</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Contoh: Praise & Worship Ibadah Minggu"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Kategori *</label>
                  <select
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  >
                    <option value="ibadah">Ibadah</option>
                    <option value="worship">Worship</option>
                    <option value="youth">Youth</option>
                    <option value="komunitas">Komunitas</option>
                    <option value="umum">Umum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Bulan / Tahun</label>
                  <input
                    type="text"
                    value={galleryForm.date}
                    onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                    placeholder="Agustus 2026"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">URL Gambar / Path Foto *</label>
                <input
                  type="text"
                  required
                  value={galleryForm.image}
                  onChange={(e) => setGalleryForm({ ...galleryForm, image: e.target.value })}
                  placeholder="https://... atau /images/logo.png"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold shadow-md"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INVENTORY */}
      {/* ========================================================================= */}
      {isInvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">
                {editingInvId ? 'Edit Barang Inventaris' : 'Tambah Barang Inventaris'}
              </h3>
              <button onClick={() => setIsInvModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={invForm.name}
                  onChange={(e) => setInvForm({ ...invForm, name: e.target.value })}
                  placeholder="Contoh: Shure Beta 58A Wireless"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Kategori *</label>
                  <select
                    value={invForm.category}
                    onChange={(e) => setInvForm({ ...invForm, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  >
                    <option value="Sound System">Sound System</option>
                    <option value="Multimedia & Kamera">Multimedia & Kamera</option>
                    <option value="Alat Musik">Alat Musik</option>
                    <option value="Ibadah & Ruangan">Ibadah & Ruangan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Kode Barang *</label>
                  <input
                    type="text"
                    required
                    value={invForm.code}
                    onChange={(e) => setInvForm({ ...invForm, code: e.target.value })}
                    placeholder="MIC-01"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Jumlah Unit</label>
                  <input
                    type="number"
                    min={1}
                    value={invForm.quantity}
                    onChange={(e) => setInvForm({ ...invForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Kondisi Alat *</label>
                  <select
                    value={invForm.condition}
                    onChange={(e) => setInvForm({ ...invForm, condition: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                  >
                    <option value="good">🟢 Baik / Normal</option>
                    <option value="maintenance">🟡 Perlu Pengecekan</option>
                    <option value="broken">🔴 Rusak / Perlu Servis</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Lokasi Penyimpanan *</label>
                <input
                  type="text"
                  required
                  value={invForm.location}
                  onChange={(e) => setInvForm({ ...invForm, location: e.target.value })}
                  placeholder="Meja Sound, Ruang Pastori, dsb."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Catatan Pengecekan</label>
                <textarea
                  rows={2}
                  value={invForm.notes}
                  onChange={(e) => setInvForm({ ...invForm, notes: e.target.value })}
                  placeholder="Kabel, adaptor, baterai, dsb."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInvModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold shadow-md"
                >
                  Simpan Inventaris
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      <UploadPhotoModal
        isOpen={isUploadPhotoModalOpen}
        onClose={() => setIsUploadPhotoModalOpen(false)}
        onUploadSuccess={(newItem) => {
          setGallery((prev) => [newItem, ...prev]);
          showToast('Foto dokumentasi berhasil ditambahkan ke galeri!');
        }}
      />

      <Footer />
    </main>
  );
}
