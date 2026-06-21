/**
 * GOOGLE APPS SCRIPT — Absensi Karyawan
 * ----------------------------------------
 * Cara pakai:
 * 1. Buka Google Sheets yang sudah kamu buat
 * 2. Klik menu Extensions > Apps Script
 * 3. Hapus semua kode yang ada, paste seluruh kode ini
 * 4. Klik Save (ikon disket)
 * 5. Klik Deploy > New deployment
 * 6. Pilih type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Klik Deploy, copy URL-nya, kirim ke admin
 */

// Nama sheet (tab) di Google Spreadsheet
const SHEET_NAME = 'Absensi';

// Header kolom (baris pertama di sheet)
const HEADERS = ['Timestamp', 'Nama', 'Jenis', 'Waktu', 'Tanggal', 'Catatan'];

function doPost(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let sheet   = ss.getSheetByName(SHEET_NAME);

    // Buat sheet baru jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4F46E5');
      headerRange.setFontColor('#FFFFFF');
    }

    // Parse data dari website
    const data = JSON.parse(e.postData.contents);

    // Tulis ke sheet
    sheet.appendRow([
      new Date(),          // Timestamp otomatis
      data.nama    || '',
      data.jenis   || '',
      data.waktu   || '',
      data.tanggal || '',
      data.catatan || '',
    ]);

    // Auto-resize kolom
    sheet.autoResizeColumns(1, HEADERS.length);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Absensi tercatat' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test manual dari editor (opsional)
function testManual() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        nama: 'Ahmad Fauzi',
        jenis: 'masuk',
        waktu: '08:05:12',
        tanggal: '21 Jun 2026',
        catatan: 'Test',
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
