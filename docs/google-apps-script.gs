/**
 * GIA DELIKSARI - GOOGLE SHEETS AUTOMATION SCRIPT
 *
 * Panduan Penggunaan:
 * 1. Buat Google Spreadsheet baru, beri judul: "GIA Deliksari - Papan Transparansi Jemaat".
 * 2. Klik menu Ekstensi (Extensions) -> Apps Script.
 * 3. Hapus kode default, lalu tempel (paste) seluruh isi file ini ke Editor.
 * 4. Buka Project Settings (ikon gerigi) -> Script Properties, klik "Add script property":
 *      Property : WEBHOOK_SECRET
 *      Value    : (buat kata sandi acak, misal: gia_deliksari_secret_2026)
 * 5. Klik tombol Deploy -> New Deployment (Penerapan Baru):
 *      - Select type : Web app (Aplikasi web)
 *      - Execute as  : Me (email Anda)
 *      - Who has access: Anyone (Siapa saja)
 * 6. Klik Deploy, izinkan akses akun Google, lalu salin "Web app URL" (URL aplikasi web).
 * 7. Simpan URL tersebut di GitHub Repository -> Settings -> Secrets and variables -> Actions:
 *      GOOGLE_SHEETS_WEBHOOK_URL = <URL_DARI_APPS_SCRIPT>
 *      GOOGLE_SHEETS_WEBHOOK_SECRET = <KATA_SANDI_YANG_SAMA_DI_STEP_4>
 */

function doPost(e) {
  try {
    const rawContent = e.postData.contents;
    const body = JSON.parse(rawContent);

    // Verifikasi Secret Token
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (expectedSecret && body.secret !== expectedSecret) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized / Secret mismatch' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = body.data;

    // 1. Sync Kas Youth
    if (data.youth_treasury && data.youth_balance) {
      updateYouthTreasurySheet(ss, data.youth_treasury, data.youth_balance, body.timestamp);
    }

    // 2. Sync Warta Jemaat
    if (data.announcements) {
      updateAnnouncementsSheet(ss, data.announcements, body.timestamp);
    }

    // 3. Sync Jadwal Pelayanan
    if (data.servant_rosters) {
      updateRosterSheet(ss, data.servant_rosters, body.timestamp);
    }

    // 4. Sync Inventaris
    if (data.inventory_items) {
      updateInventorySheet(ss, data.inventory_items, body.timestamp);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      updatedAt: new Date().toISOString(),
      tabsUpdated: ['Kas Youth', 'Warta Jemaat', 'Jadwal Pelayanan', 'Inventaris']
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function updateYouthTreasurySheet(ss, items, balance, timestamp) {
  const sheet = getOrCreateSheet(ss, 'Kas Youth');
  sheet.clear();

  // Header Title
  sheet.getRange('A1:F1').merge().setValue('LAPORAN KAS GROW GENERATION YOUTH - GIA DELIKSARI')
    .setFontWeight('bold').setFontSize(14).setBackground('#800000').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');

  sheet.getRange('A2:F2').merge().setValue('Sinkronisasi Terakhir: ' + timestamp + ' | Sumber Data: Cloudflare D1')
    .setFontSize(9).setFontColor('#555555').setHorizontalAlignment('center');

  // KPI Row
  sheet.getRange('A4').setValue('TOTAL PEMASUKAN').setFontWeight('bold');
  sheet.getRange('B4').setValue(balance.total_income || 0).setNumberFormat('Rp #,##0').setBackground('#E8F5E9');
  sheet.getRange('C4').setValue('TOTAL PENGELUARAN').setFontWeight('bold');
  sheet.getRange('D4').setValue(balance.total_expense || 0).setNumberFormat('Rp #,##0').setBackground('#FFEBEE');
  sheet.getRange('E4').setValue('SALDO KAS SAAT INI').setFontWeight('bold');
  sheet.getRange('F4').setValue(balance.balance || 0).setNumberFormat('Rp #,##0').setFontWeight('bold').setBackground('#E0F2FE');

  // Table Headers
  const headers = ['Tanggal', 'Jenis', 'Kategori', 'Jumlah (IDR)', 'Keterangan', 'ID Transaksi'];
  sheet.getRange(6, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#2B3A42').setFontColor('#FFFFFF');

  if (items && items.length > 0) {
    const rows = items.map(function(t) {
      return [
        t.transaction_date,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category,
        t.amount,
        t.description || '-',
        t.id
      ];
    });

    sheet.getRange(7, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(7, 4, rows.length, 1).setNumberFormat('Rp #,##0');

    for (let i = 0; i < rows.length; i++) {
      const type = rows[i][1];
      const rowRange = sheet.getRange(7 + i, 1, 1, headers.length);
      if (type === 'Pemasukan') {
        rowRange.setBackground('#F1F8E9');
      } else {
        rowRange.setBackground('#FFF3E0');
      }
    }
  }

  sheet.autoResizeColumns(1, headers.length);
}

function updateAnnouncementsSheet(ss, items, timestamp) {
  const sheet = getOrCreateSheet(ss, 'Warta Jemaat');
  sheet.clear();

  sheet.getRange('A1:G1').merge().setValue('WARTA JEMAAT & PENGUMUMAN GIA DELIKSARI')
    .setFontWeight('bold').setFontSize(14).setBackground('#800000').setFontColor('#FFFFFF').setHorizontalAlignment('center');

  const headers = ['Tanggal Acara', 'Kategori', 'Judul Warta', 'Badge', 'Penulis', 'Status Tampil', 'Isi Pengumuman'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2B3A42').setFontColor('#FFFFFF');

  if (items && items.length > 0) {
    const rows = items.map(function(a) {
      return [
        a.event_date,
        String(a.category || '').toUpperCase(),
        a.title,
        a.badge_text || '-',
        a.author || 'Sekretariat',
        a.is_published === 1 ? 'PUBLISH' : 'DRAFT',
        a.content
      ];
    });
    sheet.getRange(4, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.autoResizeColumns(1, headers.length);
}

function updateRosterSheet(ss, items, timestamp) {
  const sheet = getOrCreateSheet(ss, 'Jadwal Pelayanan');
  sheet.clear();

  sheet.getRange('A1:F1').merge().setValue('JADWAL PETUGAS PELAYANAN IBADAH GIA DELIKSARI')
    .setFontWeight('bold').setFontSize(14).setBackground('#800000').setFontColor('#FFFFFF').setHorizontalAlignment('center');

  const headers = ['Tanggal Ibadah', 'Kategori', 'Peran / Posisi', 'Nama Pelayan', 'Status', 'Catatan'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2B3A42').setFontColor('#FFFFFF');

  if (items && items.length > 0) {
    const rows = items.map(function(r) {
      return [
        r.service_date,
        String(r.service_category || '').toUpperCase(),
        r.role,
        r.servant_name,
        String(r.status || '').toUpperCase(),
        r.notes || '-'
      ];
    });
    sheet.getRange(4, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.autoResizeColumns(1, headers.length);
}

function updateInventorySheet(ss, items, timestamp) {
  const sheet = getOrCreateSheet(ss, 'Inventaris');
  sheet.clear();

  sheet.getRange('A1:H1').merge().setValue('DAFTAR INVENTARIS & KESIAPAN ALAT IBADAH GIA DELIKSARI')
    .setFontWeight('bold').setFontSize(14).setBackground('#800000').setFontColor('#FFFFFF').setHorizontalAlignment('center');

  const headers = ['Kode', 'Nama Barang', 'Kategori', 'Jumlah', 'Kondisi', 'Lokasi', 'Siap Ibadah?', 'Pemeriksa'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2B3A42').setFontColor('#FFFFFF');

  if (items && items.length > 0) {
    const rows = items.map(function(i) {
      return [
        i.code,
        i.name,
        i.category,
        i.quantity,
        String(i.condition || '').toUpperCase(),
        i.location,
        i.is_checked === 1 ? 'SIAP' : 'BELUM',
        i.checked_by || '-'
      ];
    });
    sheet.getRange(4, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.autoResizeColumns(1, headers.length);
}
