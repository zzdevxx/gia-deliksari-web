/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GIA DELIKSARI — Backup D1 → Google Sheets
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  CARA PASANG (sekali saja, ± 5 menit):
 *
 *  1. Buka  https://sheets.new  → buat spreadsheet baru
 *     Beri nama: "GIA Deliksari — Backup Database"
 *
 *  2. Menu:  Extensions  →  Apps Script
 *
 *  3. HAPUS semua isi file  Code.gs, lalu TEMPEL seluruh file ini.
 *
 *  4. Ganti  SECRET  di bawah dengan kata sandi rahasia buatanmu sendiri.
 *     (Huruf/angka acak, minimal 20 karakter. Jangan pakai yang mudah ditebak.)
 *
 *  5. Klik ikon  💾 Simpan  (atau Ctrl+S).
 *
 *  6. Klik tombol  [ Deploy ]  →  New deployment
 *       • Klik ikon gerigi ⚙ di samping "Select type" → pilih  Web app
 *       • Description   : GIA D1 Backup
 *       • Execute as    : Me  (emailmu)
 *       • Who has access: Anyone          ← WAJIB "Anyone", bukan "Anyone with Google account"
 *       • Klik  [ Deploy ]
 *       • Kalau muncul "Authorize access": pilih akunmu → Advanced →
 *         "Go to GIA D1 Backup (unsafe)" → Allow
 *         (Tulisan "unsafe" itu normal untuk script buatan sendiri.)
 *
 *  7. SALIN  "Web app URL"  yang muncul.
 *     Bentuknya:  https://script.google.com/macros/s/AKfycb..../exec
 *
 *  8. Kirim URL itu + SECRET yang kamu pilih ke Claude, atau pasang sendiri:
 *       gh secret set GOOGLE_SHEETS_WEBHOOK_URL --repo zzdree/gia-deliksari-web
 *       gh secret set GOOGLE_SHEETS_WEBHOOK_SECRET --repo zzdree/gia-deliksari-web
 *
 *  SELESAI. Setiap malam backup akan menulis ke spreadsheet ini.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ⬇️⬇️⬇️  GANTI DENGAN KATA SANDI RAHASMU  ⬇️⬇️⬇️
var SECRET = 'GANTI-DENGAN-KATA-SANDI-RAHASIA-20-KARAKTER';
// ⬆️⬆️⬆️  GANTI DENGAN KATA SANDI RAHASMU  ⬆️⬆️⬆️


/**
 * Nama sheet yang dipakai, dipetakan dari kunci payload.
 * `youth_balance` dilewati: itu VIEW (dihitung dari transaksi), bukan tabel.
 */
var SHEET_NAMES = {
  announcements: 'Warta',
  servant_rosters: 'Roster',
  inventory_items: 'Inventaris',
  sermons: 'Khotbah',
  gallery_items: 'Galeri',
  ministry_requests: 'Permohonan',
  users: 'Pengurus',
  youth_treasury: 'Kas Youth',
  audit_log: 'Audit Log'
};

/**
 * Urutan kolom yang diinginkan per sheet. Kolom di luar daftar ini
 * tetap ikut ditulis di belakang, supaya data baru tidak hilang.
 */
var PREFERRED_COLUMNS = {
  announcements: ['id', 'title', 'category', 'content', 'event_date', 'end_date', 'is_pinned', 'is_published', 'badge_text', 'author', 'created_at'],
  servant_rosters: ['id', 'service_category', 'service_date', 'role', 'servant_name', 'phone', 'status', 'notes', 'created_at'],
  inventory_items: ['id', 'name', 'category', 'code', 'quantity', 'is_checked', 'condition', 'location', 'notes', 'last_checked_at', 'checked_by'],
  sermons: ['id', 'title', 'speaker', 'passage', 'date', 'youtube_url', 'category', 'is_published', 'created_at'],
  gallery_items: ['id', 'title', 'category', 'image', 'drive_web_view_link', 'uploader_name', 'date', 'is_published', 'created_at'],
  ministry_requests: ['id', 'type', 'name', 'phone', 'sub_type', 'message', 'need_pastoral_visit', 'status', 'created_at'],
  users: ['id', 'username', 'roles', 'display_name', 'active', 'last_login_at', 'created_at'],
  youth_treasury: ['id', 'transaction_date', 'type', 'category', 'amount', 'description', 'created_at'],
  audit_log: ['created_at', 'actor_username', 'actor_roles', 'action', 'target_table', 'target_id', 'summary', 'ip']
};

/** Terima POST dari GitHub Actions. */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // 1. Cek kata sandi. Tanpa ini, siapa pun yang tahu URL bisa menulis ke sheet.
    if (String(body.secret || '') !== SECRET) {
      return jsonOut({ ok: false, error: 'secret tidak cocok' }, 403);
    }

    var data = body.data || {};
    var stamp = body.timestamp || new Date().toISOString();
    var ditulis = {};

    for (var key in SHEET_NAMES) {
      if (!Object.prototype.hasOwnProperty.call(SHEET_NAMES, key)) continue;
      var rows = data[key];
      if (!rows || !rows.length) { ditulis[SHEET_NAMES[key]] = 0; continue; }
      ditulis[SHEET_NAMES[key]] = writeSheet(SHEET_NAMES[key], rows);
    }

    // 2. Catat waktu backup terakhir.
    writeMeta(stamp, ditulis);

    return jsonOut({ ok: true, ditulis: ditulis, timestamp: stamp });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) }, 500);
  }
}

/** Terima GET — berguna untuk cek "apakah webhook hidup?" dari browser. */
function doGet() {
  return jsonOut({
    ok: true,
    pesan: 'Webhook backup GIA Deliksari aktif. Kirim POST untuk mengisi data.',
    waktu: new Date().toISOString()
  }, 200);
}

/**
 * Tulis ulang satu sheet: hapus isi lama, tulis header + semua baris.
 * Ditulis ulang (bukan ditambahkan) supaya sheet selalu mencerminkan
 * keadaan database saat snapshot diambil — bukan tumpukan riwayat.
 */
function writeSheet(nama, rows) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(nama) || ss.insertSheet(nama);

  // Urutkan kolom: yang diinginkan dulu, sisanya menyusul.
  var semuaKolom = {};
  rows.forEach(function (r) {
    for (var k in r) {
      if (Object.prototype.hasOwnProperty.call(r, k)) semuaKolom[k] = true;
    }
  });
  var diinginkan = (PREFERRED_COLUMNS[nama] || []).filter(function (c) { return semuaKolom[c]; });
  var sisanya = Object.keys(semuaKolom).filter(function (c) { return diinginkan.indexOf(c) === -1; }).sort();
  var kolom = diinginkan.concat(sisanya);

  if (!kolom.length) return 0;

  // Bangun matriks nilai.
  var nilai = [kolom]; // header
  rows.forEach(function (r) {
    nilai.push(kolom.map(function (c) { return formatNilai(r[c]); }));
  });

  sheet.clear();
  sheet.getRange(1, 1, nilai.length, kolom.length).setValues(nilai);

  // Percantik header.
  var header = sheet.getRange(1, 1, 1, kolom.length);
  header.setFontWeight('bold').setBackground('#8E1533').setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  // Lebar kolom otomatis, dibatasi supaya kolom panjang (isi warta) tidak melebar.
  for (var i = 0; i < kolom.length; i++) {
    var maxLen = String(kolom[i]).length;
    for (var j = 1; j < Math.min(nilai.length, 60); j++) {
      var len = String(nilai[j][i] === null || nilai[j][i] === undefined ? '' : nilai[j][i]).length;
      if (len > maxLen) maxLen = len;
    }
    sheet.setColumnWidth(i + 1, Math.max(70, Math.min(maxLen * 8 + 24, 320)));
  }

  return rows.length;
}

/** Catat ringkasan backup di sheet "Info Backup". */
function writeMeta(stamp, ditulis) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Info Backup') || ss.insertSheet('Info Backup', 0);

  var baris = [['Backup Terakhir', stamp]];
  baris.push(['']);
  baris.push(['Sheet', 'Jumlah Baris']);
  Object.keys(ditulis).forEach(function (k) { baris.push([k, ditulis[k]]); });

  sheet.clear();
  sheet.getRange(1, 1, baris.length, 2).setValues(baris);
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setFontColor('#8E1533');
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 240);
}

/** Ubah nilai apa pun jadi sesuatu yang aman ditulis ke sel. */
function formatNilai(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'YA' : 'TIDAK';
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}

/** Balas JSON. */
function jsonOut(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
