-- ============================================================================
-- GIA DELIKSARI SEMARANG - CLOUDFLARE D1 (SQLITE) SCHEMA
-- Database: gia-deliksari-db
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Table: announcements (Papan Informasi & Warta Jemaat)
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'youth', 'kidz', 'hana')),
  content TEXT NOT NULL,
  event_date TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  badge_text TEXT,
  author TEXT DEFAULT 'Sekretariat GIA Deliksari',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_announcements_event_date ON announcements(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);

-- 2. Table: servant_rosters (Jadwal Petugas Pelayanan)
CREATE TABLE IF NOT EXISTS servant_rosters (
  id TEXT PRIMARY KEY,
  service_category TEXT NOT NULL CHECK (service_category IN ('general', 'youth', 'kidz', 'hana')),
  service_date TEXT NOT NULL,
  role TEXT NOT NULL,
  servant_name TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'replacement')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_servant_rosters_date ON servant_rosters(service_date ASC);
CREATE INDEX IF NOT EXISTS idx_servant_rosters_category ON servant_rosters(service_category);

-- 3. Table: inventory_items (Inventaris & Checklist Kesiapan Ibadah)
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Sound System', 'Multimedia & Kamera', 'Alat Musik', 'Ibadah & Ruangan')),
  code TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_checked INTEGER NOT NULL DEFAULT 1 CHECK (is_checked IN (0, 1)),
  condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'maintenance', 'broken')),
  location TEXT NOT NULL,
  notes TEXT,
  last_checked_at TEXT,
  checked_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(code);

-- 4. Table: sermons (Khotbah & Arsip Audio-Visual)
CREATE TABLE IF NOT EXISTS sermons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  passage TEXT NOT NULL,
  date TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT DEFAULT 'Ibadah Raya',
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON sermons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_published ON sermons(is_published);

-- 5. Table: gallery_items (Dokumentasi Momen Jemaat)
CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ibadah', 'worship', 'youth', 'komunitas', 'umum')),
  image TEXT NOT NULL,
  thumb_url TEXT,
  drive_file_id TEXT,
  drive_web_view_link TEXT,
  uploader_name TEXT,
  date TEXT,
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON gallery_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_published ON gallery_items(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_items_drive_file_id ON gallery_items(drive_file_id);

-- 6. Table: ministry_requests (Permohonan Doa, Sakramen, Komsel, Volunteer)
CREATE TABLE IF NOT EXISTS ministry_requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('prayer', 'sacrament', 'komsel', 'volunteer')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  sub_type TEXT,
  message TEXT,
  need_pastoral_visit INTEGER NOT NULL DEFAULT 0 CHECK (need_pastoral_visit IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'pending', 'contacted', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_ministry_requests_created_at ON ministry_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ministry_requests_status ON ministry_requests(status);

-- 7. Table: users (Multi-Role Authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 64),
  password_hash TEXT NOT NULL,
  roles TEXT NOT NULL DEFAULT '["admin"]', -- JSON array of strings
  display_name TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(lower(username));
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- 8. Table: youth_treasury_transactions (Buku Kas Pemuda / Grow Generation)
CREATE TABLE IF NOT EXISTS youth_treasury_transactions (
  id TEXT PRIMARY KEY,
  transaction_date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  description TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_youth_treasury_date ON youth_treasury_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_youth_treasury_type ON youth_treasury_transactions(type);
CREATE INDEX IF NOT EXISTS idx_youth_treasury_created_by ON youth_treasury_transactions(created_by);

-- 9. Table: audit_log (Forensic Audit Trail)
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_username TEXT,
  actor_roles TEXT, -- JSON array of strings, e.g. '["super"]'
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  summary TEXT NOT NULL,
  meta TEXT,        -- JSON string
  ip TEXT,
  user_agent TEXT,
  source TEXT NOT NULL DEFAULT 'api',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_table, target_id);

-- ============================================================================
-- VIEW: youth_treasury_balance
-- ============================================================================
CREATE VIEW IF NOT EXISTS youth_treasury_balance AS
SELECT
  ROUND(COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0), 2) AS total_income,
  ROUND(COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0), 2) AS total_expense,
  ROUND(COALESCE(SUM(CASE WHEN type = 'income' THEN amount
                          WHEN type = 'expense' THEN -amount
                          ELSE 0 END), 0), 2) AS balance,
  COALESCE(SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END), 0) AS income_count,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END), 0) AS expense_count
FROM youth_treasury_transactions;

-- ============================================================================
-- TRIGGER: updated_at for youth_treasury_transactions
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS trg_youth_treasury_updated_at
AFTER UPDATE ON youth_treasury_transactions
FOR EACH ROW
WHEN (NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL)
BEGIN
  UPDATE youth_treasury_transactions
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = OLD.id;
END;
