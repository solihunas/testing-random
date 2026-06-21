/**
 * GOOGLE APPS SCRIPT — Absensi Karyawan (versi GET)
 * ----------------------------------------
 * ⚠️  SETELAH UPDATE KODE INI:
 * 1. Klik Save (💾)
 * 2. Klik Deploy > Manage deployments
 * 3. Klik ikon pensil (Edit) pada deployment yang ada
 * 4. Di "Version" pilih "New version"
 * 5. Klik Deploy
 * (URL tidak berubah, cukup update versinya)
 */

const SHEET_NAME = 'Absensi';
const HEADERS    = ['Timestamp', 'Nama', 'Jenis', 'Waktu', 'Tanggal', 'Catatan'];

function doGet(e) {
  try {
    const ss  = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Buat sheet + header jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const hr = sheet.getRange(1, 1, 1, HEADERS.length);
      sheet.appendRow(HEADERS);
      hr.setFontWeight('bold');
      hr.setBackground('#4F46E5');
      hr.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    // Ambil data dari URL parameter
    const p = e.parameter;

    // Validasi minimal
    if (!p.nama || !p.jenis) {
      return jsonResponse({ success: false, error: 'Parameter nama/jenis kosong' });
    }

    // Tulis baris baru
    sheet.appendRow([
      new Date(),          // Timestamp server (lebih akurat)
      p.nama    || '',
      p.jenis   || '',
      p.waktu   || '',
      p.tanggal || '',
      p.catatan || '-',
    ]);

    sheet.autoResizeColumns(1, HEADERS.length);

    return jsonResponse({ success: true, pesan: 'Absensi ' + p.nama + ' tercatat!' });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi test — jalankan manual dari editor untuk cek
function testCoba() {
  const e = { parameter: { nama: 'Solihun', jenis: 'masuk', waktu: '08:00:00', tanggal: '21 Jun 2026', catatan: 'Test' } };
  const result = doGet(e);
  Logger.log(result.getContent());
}
