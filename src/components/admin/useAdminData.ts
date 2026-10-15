'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Announcement,
  ServantRoster,
  InventoryItem,
  Sermon,
  GalleryItem,
  MinistryRequest,
} from '@/types';
import { adminDataStore, UnauthorizedError } from '@/lib/storage';

/**
 * Aggregated admin data state: load all 6 tables + their setters.
 * Setters wrap setState so they can be replaced by tab-local handlers
 * that also call adminDataStore.saveX (mutations).
 *
 * Each table returns:
 *   - items: T[]  current data
 *   - setItems: React.Dispatch<React.SetStateAction<T[]>>
 *
 * loadAllData is exposed for manual refresh.
 */
export function useAdminData(isAuthenticated: boolean, onError: (msg: string) => void) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [roster, setRoster] = useState<ServantRoster[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [requests, setRequests] = useState<MinistryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [ann, ros, inv, srm, gal, req] = await Promise.all([
        adminDataStore.getAnnouncements(),
        adminDataStore.getRoster(),
        adminDataStore.getInventory(),
        adminDataStore.getSermons(),
        adminDataStore.getGallery(),
        adminDataStore.getMinistryRequests(),
      ]);
      setAnnouncements(ann);
      setRoster(ros);
      setInventory(inv);
      setSermons(srm);
      setGallery(gal);
      setRequests(req);
    } catch (err) {
      // A dead session must not look like a transient load failure — say what
      // happened so the operator re-authenticates instead of editing seed rows.
      if (err instanceof UnauthorizedError) {
        console.warn('Admin data load rejected:', err.status);
        onError('Sesi admin sudah berakhir. Silakan masuk kembali.');
      } else {
        console.error('Error fetching admin data:', err);
        onError('Gagal memuat data dari database');
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (isAuthenticated) loadAllData();
  }, [isAuthenticated, loadAllData]);

  return {
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
  };
}