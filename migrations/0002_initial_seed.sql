-- ============================================================================
-- SEED DATA FOR GIA DELIKSARI D1 DATABASE
-- ============================================================================

-- 1. Seed Users (super / admin / treasurer / operator multi-role)
-- Bcrypt cost 10 hashes. PIN plaintext TIDAK disimpan di repo —
-- lihat vault pengurus. (Riwayat git lama mungkin masih memuat versi
-- komentar lama; rotasi PIN disarankan.)
INSERT OR IGNORE INTO users (id, username, password_hash, roles, display_name, active, created_at)
VALUES
  ('usr-super-01', 'andreas', '$2b$10$LF1egf/mctHo2IhU.DavAOwm.xycPBVxFX4nDWqtlYUJxMHxvHQCa', '["super"]', 'Andreas (Superuser)', 1, '2026-08-30T12:00:00.000Z'),
  ('usr-admin-01', 'noel', '$2b$10$3t7olvVg0/NBiBDy2NLl5OOt.IyjXwRGwMJr7KfmHNftkI/oqmNA2', '["admin"]', 'Noel Yosan (Admin)', 1, '2026-08-30T12:00:00.000Z'),
  ('usr-treas-01', 'mara', '$2b$10$dCJdQnSlMaercVUWEzh7Ru2Gru8UVGhMkLuhglBwTR8WW1fNMaSyu', '["treasurer"]', 'Mara (Bendahara Youth)', 1, '2026-08-30T12:00:00.000Z'),
  ('usr-zzdree-04', 'zzdree', '$2b$10$Q1HMtmFSNdW.D/6ZIA1F5.jOBDr41yeHGavSvJYBE5RRgAmkOHRR2', '["admin", "treasurer"]', 'zzdree (Operator)', 1, '2026-08-31T10:00:00.000Z');

-- 2. Seed Announcements
INSERT OR IGNORE INTO announcements (id, title, category, content, event_date, is_pinned, is_published, badge_text, author, created_at)
VALUES
  ('ann-01', 'Ibadah Raya Hari Minggu & Perjamuan Kudus', 'general', 'Mari hadir bersama keluarga dalam Ibadah Raya GIA Deliksari setiap Minggu pukul 07.00 WIB. Disertai Sakramen Perjamuan Kudus pada Minggu pertama awal bulan.', '2026-09-06', 1, 1, 'Ibadah Utama', 'Sekretariat GIA Deliksari', '2026-08-31T00:00:00.000Z'),
  ('ann-02', 'Grow Generation Youth: "Unstoppable Faith"', 'youth', 'Teman-teman kaum muda & remaja PRBK Deliksari, jangan lewatkan persekutuan sabtu ceria penuh praise and worship, firman Tuhan, dan games seru!', '2026-09-05', 1, 1, 'Youth Service', 'Pengurus Grow Generation', '2026-08-31T00:00:00.000Z'),
  ('ann-03', 'Sekolah Minggu COC Kidz: "Aku Anak Terang"', 'kidz', 'Panggilan untuk semua adik-adik terkasih! Kelas Sekolah Minggu Children Of Christ hadir dengan cerita Alkitab interaktif, mewarnai, dan bernyanyi bersama.', '2026-09-06', 0, 1, 'Kids Ministry', 'Guru Sekolah Minggu COC Kidz', '2026-08-31T00:00:00.000Z'),
  ('ann-04', 'Persekutuan Kaum Wanita "Hana Fellowship"', 'hana', 'Mengundang seluruh ibu-ibu dan kaum wanita jemaat dalam doa bersama, saling menguatkan, dan pendalaman firman Tuhan setiap hari Selasa sore.', '2026-09-08', 0, 1, 'Wanita Bijak', 'Komisi Wanita Hana', '2026-08-31T00:00:00.000Z');

-- 3. Seed Servant Rosters
INSERT OR IGNORE INTO servant_rosters (id, service_category, service_date, role, servant_name, phone, status, notes, created_at)
VALUES
  ('rst-01', 'general', '2026-09-06', 'Worship Leader (WL)', 'Sdr. Kevin Christian', '081234567890', 'confirmed', 'Latihan Sabtu pukul 18.30 WIB', '2026-08-31T00:00:00.000Z'),
  ('rst-02', 'general', '2026-09-06', 'Singer & Backing Vocal', 'Sdri. Maria & Ibu Grace', '081234567891', 'confirmed', 'Dress code: Biru Navy / Putih', '2026-08-31T00:00:00.000Z'),
  ('rst-03', 'general', '2026-09-06', 'Pemusik (Keyboard & Bass)', 'Sdr. Daniel & Sdr. Yohanes', '081234567892', 'confirmed', 'Cek kabel jack & instrumen jam 06.00 WIB', '2026-08-31T00:00:00.000Z'),
  ('rst-04', 'general', '2026-09-06', 'Multimedia & Live Stream', 'Sdr. Andreas', '081234567893', 'confirmed', 'Live streaming YouTube @GIADeliksariSemarang', '2026-08-31T00:00:00.000Z'),
  ('rst-05', 'youth', '2026-09-05', 'WL & Music Leader Youth', 'Sdr. Samuel Pratama', '081234567894', 'confirmed', 'Tema: Unstoppable Faith', '2026-08-31T00:00:00.000Z'),
  ('rst-06', 'kidz', '2026-09-06', 'Guru Kelas Kecil', 'Kak Ruth & Kak Ester', '081234567895', 'confirmed', 'Siapkan lembar aktivitas mewarnai', '2026-08-31T00:00:00.000Z'),
  ('rst-07', 'hana', '2026-09-08', 'Pemimpin Doa & Firman', 'Ibu Ps. Yohanes Sutono', '081234567896', 'confirmed', 'Ruang Fellowship Lt. 1', '2026-08-31T00:00:00.000Z');

-- 4. Seed Inventory Items
INSERT OR IGNORE INTO inventory_items (id, name, category, code, quantity, is_checked, condition, location, notes, last_checked_at, checked_by, created_at)
VALUES
  ('inv-01', 'Mixer Newbaxs CT80S (Utama)', 'Sound System', 'MIX-01', 1, 1, 'good', 'Bilik Sound Belakang', 'Mixer utama untuk ibadah raya & event besar', '2026-08-30 18:00', 'Tim Sound', '2026-08-01T00:00:00.000Z'),
  ('inv-02', 'Power Amplifier New XYS SQ7200H', 'Sound System', 'PWR-01', 1, 1, 'good', 'Bilik Sound Belakang', 'Power amplifier utama driver speaker', '2026-08-30 18:10', 'Tim Sound', '2026-08-01T00:00:00.000Z'),
  ('inv-03', 'Wireless Mic WL (Set Worship Leader)', 'Sound System', 'MIC-WL-01', 2, 1, 'good', 'Meja Sound Operator (Depan)', 'Baterai AA sudah dicek penuh', '2026-08-30 17:30', 'Tim Multimedia', '2026-08-01T00:00:00.000Z'),
  ('inv-04', 'Proyektor Utama & Screen Motorized', 'Multimedia & Kamera', 'PRJ-01', 1, 1, 'good', 'Plafon Tengah Sanctuary', 'Koneksi HDMI & OBS lancar', '2026-08-30 18:15', 'Tim Media', '2026-08-01T00:00:00.000Z'),
  ('inv-05', 'Keyboard Korg (Primary)', 'Alat Musik', 'MUS-KEY-KORG', 1, 1, 'good', 'Panggung Kiri', 'DI Box + Jack 6.5mm terpasang', '2026-08-30 17:45', 'Tim Musik', '2026-08-01T00:00:00.000Z'),
  ('inv-06', 'Drum Akustik Set + Shield', 'Alat Musik', 'MUS-DRM-AK', 1, 1, 'good', 'Panggung Kanan', 'Semua mic drum terpasang balance', '2026-08-30 17:50', 'Tim Musik', '2026-08-01T00:00:00.000Z'),
  ('inv-07', 'Nampan & Cawan Perjamuan Kudus', 'Ibadah & Ruangan', 'IBD-PK-01', 4, 1, 'good', 'Ruang Pastori / Lemari Sakramen', 'Sudah disterilkan dan siap pakai', '2026-08-30 16:00', 'Ibu Lisa', '2026-08-01T00:00:00.000Z');

-- 5. Seed Sermons
INSERT OR IGNORE INTO sermons (id, title, speaker, passage, date, youtube_url, thumbnail, category, is_published, created_at)
VALUES
  ('srm-01', 'Bertumbuh Kuat di Tengah Badai Kehidupan', 'Ps. Yohanes Sutono', 'Kolose 2:6-7 & Mazmur 1:1-3', 'Minggu, 30 Agustus 2026', 'https://www.youtube.com/@GIADeliksariSemarang', '/images/gallery-2.jpg', 'Ibadah Raya', 1, '2026-08-30T10:00:00.000Z'),
  ('srm-02', 'Generasi yang Menyala Bagi Kemuliaan Kristus', 'Kak Noel Yosan, S.Th.', '1 Timotius 4:12', 'Sabtu, 29 Agustus 2026', 'https://www.youtube.com/@GIADeliksariSemarang', '/images/gallery-6.jpg', 'Grow Generation Youth', 1, '2026-08-29T19:00:00.000Z'),
  ('srm-03', 'Keluarga Beriman yang Berakar dalam Kasih', 'Ps. Yohanes Sutono', 'Yosua 24:15 & Efesus 5:1-2', 'Minggu, 23 Agustus 2026', 'https://www.youtube.com/@GIADeliksariSemarang', '/images/gallery-5.jpg', 'Ibadah Raya', 1, '2026-08-23T10:00:00.000Z');

-- 6. Seed Gallery Items
INSERT OR IGNORE INTO gallery_items (id, title, category, image, thumb_url, date, is_published, created_at)
VALUES
  ('gal-01', 'Gedung Sanctuary GIA Deliksari Semarang', 'ibadah', '/images/gallery-1.jpg', '/images/gallery-1.jpg', 'Agustus 2026', 1, '2026-08-01T00:00:00.000Z'),
  ('gal-02', 'Pemberitaan Firman & Penggembalaan Jemaat', 'ibadah', '/images/gallery-2.jpg', '/images/gallery-2.jpg', 'Agustus 2026', 1, '2026-08-01T00:00:00.000Z'),
  ('gal-03', 'Praise & Worship DS Worship Team', 'worship', '/images/gallery-3.jpg', '/images/gallery-3.jpg', 'Juli 2026', 1, '2026-07-15T00:00:00.000Z'),
  ('gal-04', 'Keceriaan Ibadah Anak Sekolah Minggu COC Kidz', 'komunitas', '/images/gallery-4.jpg', '/images/gallery-4.jpg', 'Juli 2026', 1, '2026-07-15T00:00:00.000Z'),
  ('gal-05', 'Persekutuan & Doa Bersama Jemaat', 'komunitas', '/images/gallery-5.jpg', '/images/gallery-5.jpg', 'Juni 2026', 1, '2026-06-20T00:00:00.000Z'),
  ('gal-06', 'Fellowship Pemuda Grow Generation PRBK', 'youth', '/images/gallery-6.jpg', '/images/gallery-6.jpg', 'Juni 2026', 1, '2026-06-20T00:00:00.000Z');

-- 7. Seed Ministry Requests
INSERT OR IGNORE INTO ministry_requests (id, type, name, phone, sub_type, message, need_pastoral_visit, status, created_at)
VALUES
  ('req-01', 'prayer', 'Budi Santoso', '081234567891', 'Doa Kesembuhan', 'Mohon dukungan doa untuk kesembuhan ibu saya yang sedang dirawat.', 1, 'in_progress', '2026-08-28T08:30:00.000Z'),
  ('req-02', 'sacrament', 'Maria Stephanie', '081234567892', 'Baptisan Selam', 'Ingin dibaptis selam pada gelombang sakramen berikutnya.', 0, 'new', '2026-08-29T04:15:00.000Z'),
  ('req-03', 'volunteer', 'Kevin Pratama', '081234567893', 'Multimedia & Operator Slide', 'Rindu melayani di bagian slide & proyektor ibadah raya.', 0, 'completed', '2026-08-25T11:00:00.000Z');
