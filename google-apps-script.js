// ─────────────────────────────────────────────
//  GOOGLE APPS SCRIPT — Absensi IPI DIGITAL
//  Versi: doPost (menerima form submission)
// ─────────────────────────────────────────────

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Absensi');

    // Buat sheet + header jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet('Absensi');
      sheet.appendRow(['Timestamp', 'Nama', 'Jenis', 'Waktu', 'Tanggal', 'Catatan']);
      var h = sheet.getRange(1, 1, 1, 6);
      h.setFontWeight('bold');
      h.setBackground('#4F46E5');
      h.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    var p = e.parameter;

    sheet.appendRow([
      new Date(),
      p.nama    || '',
      p.jenis   || '',
      p.waktu   || '',
      p.tanggal || '',
      p.catatan || '-'
    ]);

    return ContentService
      .createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService
      .createTextOutput('ERROR: ' + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Jalankan fungsi ini dari editor untuk test manual
function testManual() {
  var fakeEvent = {
    parameter: {
      nama: 'Solihun',
      jenis: 'masuk',
      waktu: '08:00:00',
      tanggal: '21 Jun 2026',
      catatan: 'Test berhasil'
    }
  };
  var result = doPost(fakeEvent);
  Logger.log(result.getContent()); // harus tampil "OK"
}
