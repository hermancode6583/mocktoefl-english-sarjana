const DB_ID_PROPERTY = 'MOCK_TOEFL_SPREADSHEET_ID';

function doGet() {
  return ContentService.createTextOutput('Mock TOEFL database endpoint is running.');
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.action === 'login') return json_({ ok: true, saved: saveParticipant_(data) });
    if (data.action === 'result') return json_({ ok: true, saved: saveResult_(data) });
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function setupDatabase() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(DB_ID_PROPERTY);
  let ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { id = null; } }
  if (!id) { ss = SpreadsheetApp.create('Database Mock TOEFL - English Sarjana'); props.setProperty(DB_ID_PROPERTY, ss.getId()); }
  sheet_(ss, 'Peserta', ['Waktu Login','Session ID','Nama Sertifikat','No. HP']);
  sheet_(ss, 'Hasil Tes', ['Waktu Selesai','Session ID','Nama Sertifikat','No. HP','Listening (Estimasi)','Structure (Estimasi)','Reading (Estimasi)','Total Score (Estimasi)','Jawaban Benar','Jumlah Soal','Soal Dijawab','Durasi (detik)']);
  Logger.log('Database siap: ' + ss.getUrl());
  return ss.getUrl();
}
function saveParticipant_(d) {
  const name = clean_(d.certificateName,150), phone = clean_(d.phone,25), session = clean_(d.sessionId,80);
  if (!name || !phone || !session) throw new Error('Nama, nomor HP, dan session ID wajib diisi.');
  sheet_(openDb_(),'Peserta',['Waktu Login','Session ID','Nama Sertifikat','No. HP']).appendRow([new Date(),session,name,phone]);
  return true;
}
function saveResult_(d) {
  const name = clean_(d.certificateName,150), phone = clean_(d.phone,25), session = clean_(d.sessionId,80);
  if (!name || !phone || !session) throw new Error('Identitas peserta tidak lengkap.');
  sheet_(openDb_(),'Hasil Tes',['Waktu Selesai','Session ID','Nama Sertifikat','No. HP','Listening (Estimasi)','Structure (Estimasi)','Reading (Estimasi)','Total Score (Estimasi)','Jawaban Benar','Jumlah Soal','Soal Dijawab','Durasi (detik)']).appendRow([new Date(),session,name,phone,num_(d.listening),num_(d.structure),num_(d.reading),num_(d.totalScore),num_(d.rawCorrect),num_(d.totalQuestions),num_(d.answered),num_(d.timeUsedSeconds)]);
  return true;
}
function openDb_() { const id=PropertiesService.getScriptProperties().getProperty(DB_ID_PROPERTY); if(!id) throw new Error('Jalankan setupDatabase() terlebih dahulu.'); return SpreadsheetApp.openById(id); }
function sheet_(ss,name,headers) { let sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name); if(sh.getLastRow()===0) sh.appendRow(headers); sh.setFrozenRows(1); return sh; }
function clean_(v,n) { return String(v==null?'':v).trim().slice(0,n); }
function num_(v) { const n=Number(v); return Number.isFinite(n)?n:0; }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
