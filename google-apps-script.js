// ─────────────────────────────────────────────
//  GOOGLE APPS SCRIPT — Absensi IPI DIGITAL
// ─────────────────────────────────────────────

function getSheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId  = props.getProperty('ssId');
  var ss;

  // Buka spreadsheet yg sudah ada, atau buat baru
  try { ss = ssId ? SpreadsheetApp.openById(ssId) : null; } catch(e) { ss = null; }
  if (!ss) {
    ss = SpreadsheetApp.create('Absensi IPI DIGITAL');
    props.setProperty('ssId', ss.getId());
  }

  var sheet = ss.getSheetByName('Absensi');
  if (!sheet) {
    sheet = ss.insertSheet('Absensi');
    sheet.appendRow(['Timestamp', 'Nama', 'Jenis', 'Waktu', 'Tanggal', 'Catatan']);
    var h = sheet.getRange(1, 1, 1, 6);
    h.setFontWeight('bold');
    h.setBackground('#4F46E5');
    h.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Terima request dari website (GET dengan URL params)
function doGet(e) {
  try {
    var sheet = getSheet();
    var p = e.parameter;

    if (!p.nama) {
      return ContentService
        .createTextOutput('SKIP: no data')
        .setMimeType(ContentService.MimeType.TEXT);
    }

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

// Tetap ada doPost untuk jaga-jaga
function doPost(e) { return doGet(e); }

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
  var result = doGet(fakeEvent);
  Logger.log(result.getContent()); // harus tampil "OK"
}
