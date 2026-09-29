// ============================================================
//  MODUL LATIHAN (ATS/AAS)
//  File ini boleh ditambahkan sebagai skrip KEDUA di project Apps Script
//  yang sama dengan Code.gs (File → + → Script → nama "Latihan").
//  Konstanta + fungsi di bawah dipakai bersama file Code.gs.
// ============================================================

const SHEET_BANK_SOAL = 'Bank_Soal';
const SHEET_DAFTAR_LATIHAN = 'Daftar_Latihan';
const SHEET_HASIL_LATIHAN = 'Hasil_Latihan';

const KOLOM_BANK_SOAL = [
  'ID_Soal', 'Mapel', 'Materi', 'Sub_Materi', 'Tipe', 'Kompleksitas',
  'Pertanyaan', 'Opsi_JSON', 'Kunci_JSON', 'Pembahasan', 'Skor',
  'Context_ID', 'Context_Judul', 'Context_Teks', 'Status', 'Tahun_Ajaran', 'Semester'
];

const KOLOM_DAFTAR_LATIHAN = [
  'ID_Latihan', 'Nama_Latihan', 'Mapel', 'Materi', 'Kompleksitas',
  'ID_Soal_List', 'Jumlah_Soal', 'Durasi_Menit', 'Token',
  'Boleh_Ulang', 'Kirim_Email_Ortu', 'Status', 'Dibuat', 'Catatan'
];

const KOLOM_HASIL_LATIHAN = [
  'Timestamp', 'ID_Latihan', 'Nama_Latihan', 'Nama_Siswa', 'Mapel', 'Materi',
  'Percobaan_Ke', 'Skor', 'Skor_Maksimal', 'Persentase', 'Detail_JSON',
  'Status_Email_Ortu', 'Waktu_Kirim_Email'
];

function setupSheetLatihan_() {
  const ss = getSS_();
  const hasil = [];
  hasil.push(pastikanSheetDenganHeader_(ss, SHEET_BANK_SOAL, KOLOM_BANK_SOAL));
  hasil.push(pastikanSheetDenganHeader_(ss, SHEET_DAFTAR_LATIHAN, KOLOM_DAFTAR_LATIHAN));
  hasil.push(pastikanSheetDenganHeader_(ss, SHEET_HASIL_LATIHAN, KOLOM_HASIL_LATIHAN));
  Logger.log('setupSheetLatihan_ selesai: ' + hasil.join(' | '));
  return hasil;
}

function pastikanSheetDenganHeader_(ss, namaSheet, header) {
  let sheet = ss.getSheetByName(namaSheet);
  if (!sheet) {
    sheet = ss.insertSheet(namaSheet);
    sheet.appendRow(header);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return namaSheet + ': dibuat';
  }
  const existing = sheet.getRange(1, 1, 1, header.length).getValues()[0];
  const kosong = existing.every(function (c) { return c === '' || c === null; });
  if (kosong || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return namaSheet + ': header diisi';
  }
  return namaSheet + ': sudah ada (header tidak diubah)';
}

function importBankSoalRows_(rows) {
  if (!rows || !rows.length) {
    return { ok: false, pesan: 'Tidak ada baris untuk diimpor.' };
  }
  const ss = getSS_();
  pastikanSheetDenganHeader_(ss, SHEET_BANK_SOAL, KOLOM_BANK_SOAL);
  const sheet = ss.getSheetByName(SHEET_BANK_SOAL);
  const data = sheet.getDataRange().getValues();
  const existing = {};
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0] || '').trim();
    if (id) existing[id] = true;
  }
  let added = 0;
  let skipped = 0;
  const buffer = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const id = String(r.ID_Soal || r.id || '').trim();
    if (!id) { skipped++; continue; }
    if (existing[id]) { skipped++; continue; }
    existing[id] = true;
    buffer.push([
      id,
      r.Mapel || r.mapel || '',
      r.Materi || r.materi || '',
      r.Sub_Materi || r.sub_materi || '',
      r.Tipe || r.tipe || 'pg',
      r.Kompleksitas || r.kompleksitas || 'L1',
      r.Pertanyaan || r.pertanyaan || '',
      typeof (r.Opsi_JSON || r.opsi) === 'string' ? (r.Opsi_JSON || r.opsi) : JSON.stringify(r.Opsi_JSON || r.opsi || []),
      typeof (r.Kunci_JSON || r.kunci) === 'string' ? (r.Kunci_JSON || r.kunci) : JSON.stringify(r.Kunci_JSON || r.kunci || []),
      r.Pembahasan || r.pembahasan || '',
      r.Skor != null ? r.Skor : (r.skor != null ? r.skor : 1),
      r.Context_ID || r.context_id || '',
      r.Context_Judul || r.context_judul || '',
      r.Context_Teks || r.context_teks || '',
      r.Status || 'aktif',
      r.Tahun_Ajaran || '2026/2027',
      r.Semester || 'ganjil'
    ]);
    added++;
  }
  if (buffer.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, buffer.length, KOLOM_BANK_SOAL.length).setValues(buffer);
  }
  const msg = 'Impor selesai. Ditambah: ' + added + ', dilewati: ' + skipped;
  Logger.log(msg);
  return { ok: true, added: added, skipped: skipped, pesan: msg };
}

function importBankSoalDariStaging_() {
  const ss = getSS_();
  const staging = ss.getSheetByName('Import_Bank_Staging');
  if (!staging) {
    const pesan = 'Sheet Import_Bank_Staging belum ada.';
    Logger.log(pesan);
    return { ok: false, pesan: pesan };
  }
  const values = staging.getDataRange().getValues();
  if (values.length < 2) return { ok: false, pesan: 'Staging kosong.' };
  const headers = values[0].map(function (h) { return String(h).trim(); });
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    let kosongSemua = true;
    for (let c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      const v = values[i][c];
      if (v !== '' && v !== null) kosongSemua = false;
      obj[headers[c]] = v;
    }
    if (!kosongSemua) rows.push(obj);
  }
  return importBankSoalRows_(rows);
}

function ambilDaftarLatihan_() {
  const sheet = getSS_().getSheetByName(SHEET_DAFTAR_LATIHAN);
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, latihan: [] };
  const data = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][11] || '').trim().toLowerCase();
    if (status && status !== 'aktif') continue;
    list.push({
      idLatihan: String(data[i][0] || '').trim(),
      namaLatihan: data[i][1],
      mapel: data[i][2],
      materi: data[i][3],
      kompleksitas: data[i][4],
      jumlahSoal: data[i][6],
      durasiMenit: data[i][7],
      bolehUlang: String(data[i][9] || 'ya').trim().toLowerCase() !== 'tidak',
      kirimEmailOrtu: String(data[i][10] || 'ya').trim().toLowerCase() !== 'tidak',
      status: data[i][11]
    });
  }
  return { ok: true, latihan: list };
}

function ambilInfoLatihan_(idLatihan) {
  const sheet = getSS_().getSheetByName(SHEET_DAFTAR_LATIHAN);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === idLatihan) {
      return {
        idLatihan: String(data[i][0]).trim(),
        namaLatihan: data[i][1],
        mapel: data[i][2],
        materi: data[i][3],
        kompleksitas: data[i][4],
        idSoalList: String(data[i][5] || '').split(';').map(function (s) { return s.trim(); }).filter(Boolean),
        jumlahSoal: data[i][6],
        durasiMenit: data[i][7],
        token: String(data[i][8] || '').trim(),
        bolehUlang: String(data[i][9] || 'ya').trim().toLowerCase() !== 'tidak',
        kirimEmailOrtu: String(data[i][10] || 'ya').trim().toLowerCase() !== 'tidak',
        status: data[i][11]
      };
    }
  }
  return null;
}

function mulaiLatihan_(body) {
  const idLatihan = String(body.idLatihan || '').trim();
  const token = String(body.token || '').trim();
  const nama = String(body.nama || '').trim();
  if (!idLatihan || !token || !nama) {
    return { ok: false, pesan: 'Nama, token, dan latihan wajib diisi.' };
  }
  const info = ambilInfoLatihan_(idLatihan);
  if (!info) return { ok: false, pesan: 'Latihan tidak ditemukan. Hubungi guru.' };
  if (String(info.status || '').trim().toLowerCase() !== 'aktif') {
    return { ok: false, pesan: 'Latihan ini sedang tidak aktif.' };
  }
  if (token !== info.token) {
    return { ok: false, pesan: 'Token salah. Coba tanyakan lagi ke gurumu.' };
  }
  if (!daftarNamaValid_().includes(nama)) {
    return { ok: false, pesan: 'Nama tidak ditemukan di daftar siswa.' };
  }
  if (!info.bolehUlang && hitungPercobaanLatihan_(idLatihan, nama) > 0) {
    return { ok: false, pesan: 'Kamu sudah pernah mengerjakan latihan ini.' };
  }
  return { ok: true, latihan: info };
}

function hitungPercobaanLatihan_(idLatihan, nama) {
  const sheet = getSS_().getSheetByName(SHEET_HASIL_LATIHAN);
  if (!sheet || sheet.getLastRow() < 2) return 0;
  const data = sheet.getDataRange().getValues();
  let n = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1] || '').trim() === idLatihan && String(data[i][3] || '').trim() === nama) n++;
  }
  return n;
}

function ambilSoalLatihan_(idLatihan) {
  const info = ambilInfoLatihan_(idLatihan);
  if (!info) return { ok: false, pesan: 'Latihan tidak ditemukan.' };
  if (String(info.status || '').trim().toLowerCase() !== 'aktif') {
    return { ok: false, pesan: 'Latihan tidak aktif.' };
  }
  const ids = info.idSoalList;
  if (!ids.length) return { ok: false, pesan: 'Latihan belum punya daftar soal.' };
  const sheet = getSS_().getSheetByName(SHEET_BANK_SOAL);
  if (!sheet || sheet.getLastRow() < 2) return { ok: false, pesan: 'Bank soal kosong.' };
  const data = sheet.getDataRange().getValues();
  const byId = {};
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0] || '').trim();
    if (!id) continue;
    const status = String(data[i][14] || 'aktif').trim().toLowerCase();
    if (status && status !== 'aktif') continue;
    let opsi = [], kunci = [];
    try { opsi = JSON.parse(data[i][7] || '[]'); } catch (e) { opsi = []; }
    try { kunci = JSON.parse(data[i][8] || '[]'); } catch (e) { kunci = []; }
    byId[id] = {
      id: id, mapel: data[i][1], materi: data[i][2], subMateri: data[i][3],
      tipe: data[i][4], kompleksitas: data[i][5], pertanyaan: data[i][6],
      opsi: opsi, kunci: kunci, pembahasan: data[i][9], skor: data[i][10] || 1,
      contextId: data[i][11] || null, contextJudul: data[i][12] || null, contextTeks: data[i][13] || null
    };
  }
  const soal = [];
  const hilang = [];
  for (let i = 0; i < ids.length; i++) {
    if (byId[ids[i]]) soal.push(byId[ids[i]]);
    else hilang.push(ids[i]);
  }
  return {
    ok: true,
    latihan: {
      idLatihan: info.idLatihan, namaLatihan: info.namaLatihan,
      mapel: info.mapel, materi: info.materi, durasiMenit: info.durasiMenit
    },
    soal: soal, idHilang: hilang
  };
}

function submitLatihan_(body) {
  const idLatihan = String(body.idLatihan || '').trim();
  const token = String(body.token || '').trim();
  const nama = String(body.nama || '').trim();
  const hasil = body.hasil;
  const cek = mulaiLatihan_({ idLatihan: idLatihan, token: token, nama: nama });
  if (!cek.ok) return cek;
  if (!hasil || typeof hasil.skor === 'undefined') {
    return { ok: false, pesan: 'Data hasil latihan tidak lengkap.' };
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let percobaanKe = 1;
  try {
    percobaanKe = hitungPercobaanLatihan_(idLatihan, nama) + 1;
    if (!cek.latihan.bolehUlang && percobaanKe > 1) {
      return { ok: false, pesan: 'Kamu sudah pernah mengerjakan latihan ini.' };
    }
    simpanHasilLatihan_(cek.latihan, nama, hasil, percobaanKe);
  } finally {
    lock.releaseLock();
  }
  let statusEmail = 'Dilewati';
  if (cek.latihan.kirimEmailOrtu) {
    const emailOrtu = ambilEmailOrtu_(nama);
    if (!emailOrtu) {
      statusEmail = 'Email ortu belum diisi';
      catatLogEmail_(nama, idLatihan, '', 'Dilewati', 'Kolom Email Orang Tua kosong.');
    } else {
      try {
        kirimEmailLatihan_(emailOrtu, nama, cek.latihan.namaLatihan, hasil, percobaanKe);
        statusEmail = 'Terkirim';
        catatLogEmail_(nama, idLatihan, emailOrtu, 'Sukses', '');
      } catch (err) {
        statusEmail = 'Gagal terkirim';
        catatLogEmail_(nama, idLatihan, emailOrtu, 'Gagal', String(err.message || err));
      }
    }
    updateStatusEmailLatihan_(idLatihan, nama, percobaanKe, statusEmail);
  }
  return { ok: true, hasil: hasil, percobaanKe: percobaanKe, statusEmail: statusEmail };
}

function simpanHasilLatihan_(info, nama, hasil, percobaanKe) {
  const ss = getSS_();
  pastikanSheetDenganHeader_(ss, SHEET_HASIL_LATIHAN, KOLOM_HASIL_LATIHAN);
  const sheet = ss.getSheetByName(SHEET_HASIL_LATIHAN);
  sheet.appendRow([
    new Date(), info.idLatihan, info.namaLatihan, nama, info.mapel, info.materi,
    percobaanKe, hasil.skor, hasil.skorMaksimal, hasil.persentase,
    hasil.detail ? JSON.stringify(hasil.detail) : '', 'Belum dikirim', ''
  ]);
}

function updateStatusEmailLatihan_(idLatihan, nama, percobaanKe, status) {
  const sheet = getSS_().getSheetByName(SHEET_HASIL_LATIHAN);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1] || '').trim() === idLatihan &&
        String(data[i][3] || '').trim() === nama &&
        Number(data[i][6]) === Number(percobaanKe)) {
      sheet.getRange(i + 1, 12).setValue(status);
      sheet.getRange(i + 1, 13).setValue(new Date());
      return true;
    }
  }
  return false;
}

function kirimEmailLatihan_(emailTujuan, namaSiswa, namaLatihan, hasil, percobaanKe) {
  const teksPolos =
    'Hasil Latihan ' + namaLatihan + ' — ' + namaSiswa + '\n\n' +
    'Percobaan ke-' + percobaanKe + '\n' +
    'Skor: ' + hasil.skor + ' / ' + hasil.skorMaksimal + ' (' + hasil.persentase + ')\n\n' +
    '— ' + NAMA_PENGIRIM;
  const html =
    '<div style="font-family:Georgia,serif;color:#23241F;max-width:560px;margin:0 auto;padding:24px;">' +
    '<p style="font-size:13px;color:#5B5D55;">Latihan persiapan asesmen</p>' +
    '<h1 style="font-size:22px;margin:0 0 8px;">' + namaLatihan + '</h1>' +
    '<p style="font-size:15px;margin:0 0 16px;">Hasil ananda <b>' + namaSiswa + '</b> (percobaan ke-' + percobaanKe + ')</p>' +
    '<p style="font-size:28px;font-weight:700;color:#0F6B5C;margin:0 0 24px;">' +
    hasil.skor + ' / ' + hasil.skorMaksimal +
    ' <span style="font-size:16px;font-weight:500;color:#5B5D55;">(' + hasil.persentase + ')</span></p>' +
    '<p style="font-size:13px;color:#5B5D55;">Ananda boleh mengulang latihan ini untuk memperkuat pemahaman.</p>' +
    '<p style="font-size:12px;color:#8A8C82;margin-top:32px;">— ' + NAMA_PENGIRIM + '</p></div>';
  MailApp.sendEmail({
    to: emailTujuan,
    subject: 'Hasil Latihan ' + namaLatihan + ' — ' + namaSiswa,
    body: teksPolos, htmlBody: html, name: NAMA_PENGIRIM
  });
}

function ambilRiwayatLatihan_(filter) {
  filter = filter || {};
  const sheet = getSS_().getSheetByName(SHEET_HASIL_LATIHAN);
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, hasil: [] };
  const data = sheet.getDataRange().getValues();
  const namaFilter = String(filter.nama || '').trim();
  const mapelFilter = String(filter.mapel || '').trim().toLowerCase();
  const materiFilter = String(filter.materi || '').trim().toLowerCase();
  const idFilter = String(filter.idLatihan || '').trim();
  const hasil = [];
  for (let i = 1; i < data.length; i++) {
    const nama = String(data[i][3] || '').trim();
    if (nama === NAMA_AKUN_TES) continue;
    if (namaFilter && nama !== namaFilter) continue;
    if (idFilter && String(data[i][1] || '').trim() !== idFilter) continue;
    const mapel = String(data[i][4] || '');
    const materi = String(data[i][5] || '');
    if (mapelFilter && mapel.toLowerCase().indexOf(mapelFilter) === -1) continue;
    if (materiFilter && materi.toLowerCase().indexOf(materiFilter) === -1) continue;
    hasil.push({
      timestamp: data[i][0],
      tanggal: data[i][0] ? formatTanggalIndo_(new Date(data[i][0])) : '',
      idLatihan: data[i][1], namaLatihan: data[i][2], namaSiswa: nama,
      mapel: mapel, materi: materi, percobaanKe: data[i][6],
      skor: data[i][7], skorMaksimal: data[i][8], persentase: data[i][9], statusEmail: data[i][11]
    });
  }
  return { ok: true, hasil: hasil };
}
