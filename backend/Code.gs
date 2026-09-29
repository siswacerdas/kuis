/**
 * ============================================================
 *  BACKEND KUIS DIGITAL — SDM01KKS
 * ============================================================
 * File ini ditempel di Google Apps Script yang terhubung ke
 * Spreadsheet "Database_Kuis". Fungsinya sebagai "penjaga pintu"
 * antara halaman kuis (HTML) dan spreadsheet:
 *   1. Memberi daftar nama siswa untuk halaman login
 *   2. Mengecek token & apakah siswa sudah pernah mengerjakan
 *   3. Menyimpan hasil kuis
 *   4. Mengirim email hasil ke orang tua lewat MailApp (Google)
 *   5. Menyediakan data riwayat kuis (live) untuk halaman riwayat-kuis
 *
 * CATATAN: email dikirim otomatis memakai akun Google yang dipakai
 * untuk men-deploy script ini (akun yang sama dengan pemilik/
 * pengelola spreadsheet ini). Tidak perlu API key atau verifikasi
 * sender seperti sebelumnya saat masih memakai Brevo. Batas kirim:
 * 100 email/hari untuk akun Gmail biasa, 1.500/hari untuk akun
 * Google Workspace sekolah.
 *
 * Della TIDAK PERLU mengedit bagian tengah (fungsi-fungsi ber-
 * awalan huruf kecil). Yang perlu disesuaikan hanya bagian
 * KONFIGURASI di bawah ini.
 * ============================================================
 */

// ================= KONFIGURASI (boleh diubah) =================

const SPREADSHEET_ID = '1jT4Lbqkg7YfnGcS7OH5mHBWrJ7k4V23Vz5DobKrX1U0';

const SHEET_SISWA = 'Nama_Siswa';
const SHEET_DAFTAR_KUIS = 'Daftar_Kuis';
const SHEET_HASIL = 'Hasil_Kuis';
const SHEET_LOG_EMAIL = 'Log_Email';

// Modul latihan ada di file Latihan.gs (tambahkan sebagai skrip kedua di project yang sama).

// Nama akun yang TIDAK dimunculkan di halaman riwayat kuis (hanya dipakai
// internal untuk keperluan tes fitur kuis, bukan siswa sungguhan).
const NAMA_AKUN_TES = 'Tes Sistem';

// Nama pengirim yang tampil di kotak masuk orang tua (alamat emailnya
// otomatis mengikuti akun Google yang men-deploy script ini — lihat
// catatan di komentar atas file).
const NAMA_PENGIRIM = 'Arif Azwar Anas';

// Kolom pada sheet Hasil_Kuis (urutan HARUS sama dengan header di spreadsheet)
const KOLOM_HASIL = [
  'Timestamp', 'ID_Kuis', 'Nama_Kuis', 'Nama_Siswa', 'Skor', 'Skor_Maksimal',
  'Persentase', 'Kompetensi_A', 'Kompetensi_B', 'Kompetensi_C', 'Kompetensi_D',
  'Kompetensi_E', 'Kompetensi_F', 'Status_Email_Ortu', 'Waktu_Kirim_Email'
];

// Label kompetensi ini HANYA dipakai sebagai CADANGAN (fallback) kalau
// halaman kuis lupa mengirimkan labelKompetensi-nya sendiri. Idealnya,
// setiap halaman kuis (bunyi.html, deskripsi.html, dst.) mengirim label
// kompetensinya masing-masing lewat hasil.labelKompetensi saat submit,
// supaya file ini TIDAK PERLU diubah setiap kali ada kuis/mapel baru.
const DEFAULT_LABEL_KOMPETENSI = {
  A: 'Memahami bagaimana bunyi terjadi dan dihasilkan, yaitu melalui getaran benda',
  B: 'Memahami proses hingga manusia dapat mendengar bunyi, mulai dari bagian-bagian telinga',
  C: 'Memahami proses bunyi merambat sampai ke telinga, melalui benda padat, cair, dan gas',
  D: 'Membandingkan dan menyimpulkan efektivitas benda padat, cair, dan gas dalam menghantarkan bunyi',
  E: 'Memahami hasil eksperimen pengujian rambatan bunyi (lewat meja, air, dan udara)',
  F: 'Memahami proses dan cara kerja eksperimen pembuatan telepon kaleng/gelas plastik dengan benang'
};

// ================= FUNGSI TES (jalankan manual dari editor Apps Script) =================

/**
 * Fungsi KHUSUS UNTUK MENGUJI apakah MailApp bisa mengirim email dari akun
 * ini — di luar seluruh alur kuis (login, token, spreadsheet, dsb).
 *
 * Cara pakai:
 * 1. GANTI 'ganti-dengan-email-tujuan-tes@gmail.com' di bawah ini dengan
 *    email Della sendiri (atau email lain yang bisa dicek).
 * 2. Simpan (ikon disket).
 * 3. Di toolbar atas editor Apps Script, pilih "tesKirimEmail" dari dropdown
 *    daftar fungsi (biasanya di sebelah tombol Run/Debug), lalu klik Run.
 * 4. Kalau muncul jendela izin, klik Allow/Izinkan.
 * 5. Buka tab "Executions" (ikon jam di sisi kiri) untuk lihat hasilnya,
 *    dan cek juga kotak masuk (+ folder spam) email tujuan tadi.
 *
 * Kalau langkah ini GAGAL → masalahnya di MailApp/izin akun, belum sampai
 * ke logika kuis sama sekali. Kalau langkah ini BERHASIL tapi email dari
 * kuis tetap tidak sampai → masalahnya ada di alur submitKuis_ (misalnya
 * kolom Email Orang Tua kosong) — cek Log_Email dan Executions saat
 * submit kuis untuk detailnya.
 */
function tesKirimEmail() {
  const emailTes = 'ganti-dengan-email-tujuan-tes@gmail.com';
  MailApp.sendEmail({
    to: emailTes,
    subject: 'Tes pengiriman email — Kuis Digital SDM01KKS',
    body: 'Kalau email ini sampai di kotak masuk (atau spam), berarti MailApp berhasil mengirim dari akun ini.',
    name: NAMA_PENGIRIM
  });
  Logger.log('Selesai mencoba kirim email tes ke: ' + emailTes);
}



// ================= TITIK MASUK (dipanggil dari HTML) =================

function doGet(e) {
  // Pengaman: kalau fungsi ini ditekan lewat tombol "Run" di editor Apps
  // Script (bukan diakses lewat URL Web App), Google tidak mengirim data
  // "e", sehingga e.parameter akan error. doGet HARUS diuji lewat URL
  // Web App (...exec?action=daftarSiswa), bukan lewat tombol Run.
  if (!e || !e.parameter) {
    return jsonResponse_({
      ok: false,
      pesan: 'doGet harus diakses lewat URL Web App (bukan tombol Run di editor). Lihat langkah 5 di PANDUAN_SETUP.md.'
    });
  }

  const action = e.parameter.action;

  if (action === 'daftarSiswa') {
    return jsonResponse_(ambilDaftarSiswa_());
  }
  if (action === 'riwayatKuis') {
    return jsonResponse_(ambilRiwayatKuis_());
  }
  if (action === 'cekStatusKuis') {
    const idKuis = String(e.parameter.idKuis || '').trim();
    const nama = String(e.parameter.nama || '').trim();
    if (!idKuis || !nama) {
      return jsonResponse_({ ok: false, pesan: 'idKuis dan nama wajib diisi.' });
    }
    return jsonResponse_(cekStatusKuis_(idKuis, nama));
  }
  // --- LATIHAN (fungsi di file Latihan.gs) ---
  if (action === 'daftarLatihan') {
    return jsonResponse_(ambilDaftarLatihan_());
  }
  if (action === 'soalLatihan') {
    const idLatihan = String(e.parameter.idLatihan || '').trim();
    if (!idLatihan) {
      return jsonResponse_({ ok: false, pesan: 'idLatihan wajib diisi.' });
    }
    return jsonResponse_(ambilSoalLatihan_(idLatihan));
  }
  if (action === 'riwayatLatihan') {
    return jsonResponse_(ambilRiwayatLatihan_({
      nama: e.parameter.nama || '',
      mapel: e.parameter.mapel || '',
      materi: e.parameter.materi || '',
      idLatihan: e.parameter.idLatihan || ''
    }));
  }
  return jsonResponse_({ ok: false, pesan: 'Aksi GET tidak dikenal.' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, pesan: 'Data yang dikirim tidak valid.' });
  }

  const action = body.action;

  if (action === 'mulaiKuis') {
    return jsonResponse_(mulaiKuis_(body));
  }
  if (action === 'submitKuis') {
    return jsonResponse_(submitKuis_(body));
  }
  // --- LATIHAN (fungsi di file Latihan.gs) ---
  if (action === 'mulaiLatihan') {
    return jsonResponse_(mulaiLatihan_(body));
  }
  if (action === 'submitLatihan') {
    return jsonResponse_(submitLatihan_(body));
  }
  if (action === 'loginGuru') {
    return jsonResponse_(loginGuru_(body));
  }
  // Setup sekali pakai (dipanggil dari halaman setup HTML, bukan dropdown editor)
  if (action === 'setupLatihan') {
    return jsonResponse_(setupLatihanDariWeb_(body));
  }
  if (action === 'importBankSoal') {
    return jsonResponse_(importBankSoalDariWeb_(body));
  }
  return jsonResponse_({ ok: false, pesan: 'Aksi POST tidak dikenal.' });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSS_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// ================= LANGKAH 1: DAFTAR NAMA SISWA =================

function ambilDaftarSiswa_() {
  const sheet = getSS_().getSheetByName(SHEET_SISWA);
  const data = sheet.getDataRange().getValues();
  const nama = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) nama.push(String(data[i][0]).trim());
  }
  return { ok: true, siswa: nama };
}

function ambilEmailOrtu_(namaSiswa) {
  const sheet = getSS_().getSheetByName(SHEET_SISWA);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === namaSiswa) {
      return data[i][1] ? String(data[i][1]).trim() : '';
    }
  }
  return '';
}

// ================= LANGKAH 2: VALIDASI TOKEN & CEK 1X KERJA =================

/**
 * Dipanggil saat siswa mengetuk "Masuk kuis" (sebelum soal ditampilkan).
 * body: { idKuis, token, nama }
 */
function mulaiKuis_(body) {
  const idKuis = String(body.idKuis || '').trim();
  const token = String(body.token || '').trim();
  const nama = String(body.nama || '').trim();

  if (!idKuis || !token || !nama) {
    return { ok: false, pesan: 'Nama, token, dan kuis wajib diisi.' };
  }

  const infoKuis = ambilInfoKuis_(idKuis);
  if (!infoKuis) {
    return { ok: false, pesan: 'Kuis tidak ditemukan. Hubungi guru.' };
  }
  if (String(infoKuis.status).trim().toLowerCase() !== 'aktif') {
    return { ok: false, pesan: 'Kuis ini sedang tidak aktif.' };
  }
  if (token !== infoKuis.token) {
    return { ok: false, pesan: 'Token salah. Coba tanyakan lagi ke gurumu.' };
  }
  if (!daftarNamaValid_().includes(nama)) {
    return { ok: false, pesan: 'Nama tidak ditemukan di daftar siswa.' };
  }
  if (sudahMengerjakan_(idKuis, nama)) {
    return { ok: false, pesan: 'Kamu sudah pernah mengerjakan kuis ini sebelumnya.' };
  }

  return { ok: true, kuis: infoKuis };
}

function daftarNamaValid_() {
  return ambilDaftarSiswa_().siswa;
}

function ambilInfoKuis_(idKuis) {
  const sheet = getSS_().getSheetByName(SHEET_DAFTAR_KUIS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === idKuis) {
      return {
        idKuis: String(data[i][0]).trim(),
        namaKuis: data[i][1],
        mapel: data[i][2],
        jumlahSoal: data[i][3],
        durasiMenit: data[i][4],
        token: String(data[i][5]).trim(),
        status: data[i][6]
      };
    }
  }
  return null;
}

function sudahMengerjakan_(idKuis, nama) {
  const sheet = getSS_().getSheetByName(SHEET_HASIL);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === idKuis && String(data[i][3]).trim() === nama) {
      return true;
    }
  }
  return false;
}

/**
 * Dipanggil dari halaman kuis (GET, tanpa token) untuk mengecek apakah
 * seorang siswa BENAR-BENAR masih tercatat sudah mengerjakan kuis tsb di
 * spreadsheet — dipakai untuk memvalidasi catatan "selesai" yang tersimpan
 * di localStorage perangkat siswa, supaya kalau guru menghapus baris hasil
 * di sheet Hasil_Kuis (mis. karena kendala teknis), siswa yang bersangkutan
 * bisa langsung mengulang kuisnya dari perangkat yang sama tanpa perlu
 * membersihkan cache/localStorage secara manual.
 */
function cekStatusKuis_(idKuis, nama) {
  return { ok: true, sudahMengerjakan: sudahMengerjakan_(idKuis, nama) };
}

// ================= LANGKAH 3: SUBMIT, SIMPAN, KIRIM EMAIL =================

/**
 * Dipanggil saat siswa menekan "Selesai & Kumpulkan".
 * body: {
 *   idKuis, token, nama,
 *   hasil: {
 *     skor, skorMaksimal, persentase,          // contoh: 17, 20, "85%"
 *     kompetensi: { A: "3/3", B: "4/5", ... }  // ringkasan per kompetensi
 *   }
 * }
 * Catatan: penilaian (skor benar/salah) dihitung di sisi HTML/JavaScript
 * kuis, bukan di sini — supaya kunci jawaban tidak perlu diduplikasi di
 * dua tempat. Ini cukup aman untuk kuis latihan harian seperti ini,
 * tapi bukan level keamanan ujian resmi/bersertifikat.
 */
function submitKuis_(body) {
  const idKuis = String(body.idKuis || '').trim();
  const token = String(body.token || '').trim();
  const nama = String(body.nama || '').trim();
  const hasil = body.hasil;

  const cek = mulaiKuis_({ idKuis, token, nama });
  if (!cek.ok) return cek;

  if (!hasil || typeof hasil.skor === 'undefined') {
    return { ok: false, pesan: 'Data hasil kuis tidak lengkap.' };
  }

  // Kunci supaya dua submit dalam waktu bersamaan tidak lolos berdua-duanya
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (sudahMengerjakan_(idKuis, nama)) {
      return { ok: false, pesan: 'Kamu sudah pernah mengerjakan kuis ini sebelumnya.' };
    }
    simpanHasil_(idKuis, cek.kuis.namaKuis, nama, hasil);
    Logger.log('Hasil kuis "' + nama + '" (' + idKuis + ') sudah tersimpan di Hasil_Kuis.');
  } finally {
    lock.releaseLock();
  }

  // Kirim email ke orang tua. Kalau gagal, hasil kuis siswa TETAP tersimpan —
  // kegagalan email tidak boleh membuat siswa kehilangan hasilnya.
  let statusEmail = 'Belum dikirim';
  const emailOrtu = ambilEmailOrtu_(nama);
  Logger.log('Email ortu untuk "' + nama + '": ' + (emailOrtu ? emailOrtu : '(kosong/tidak diisi)'));

  if (!emailOrtu) {
    statusEmail = 'Email ortu belum diisi';
    catatLogEmail_(nama, idKuis, '', 'Dilewati', 'Kolom Email Orang Tua kosong di sheet Nama_Siswa.');
  } else {
    try {
      kirimEmailGoogle_(emailOrtu, nama, cek.kuis.namaKuis, hasil);
      statusEmail = 'Terkirim';
      Logger.log('Email ke ' + emailOrtu + ' berhasil dikirim (tidak ada error dari MailApp).');
      catatLogEmail_(nama, idKuis, emailOrtu, 'Sukses', '');
    } catch (err) {
      statusEmail = 'Gagal terkirim';
      Logger.log('GAGAL mengirim email ke ' + emailOrtu + ': ' + String(err.message || err));
      catatLogEmail_(nama, idKuis, emailOrtu, 'Gagal', String(err.message || err));
    }
  }

  const berhasilUpdate = updateStatusEmail_(idKuis, nama, statusEmail);
  if (!berhasilUpdate) {
    Logger.log('PERINGATAN: baris "' + nama + '" (' + idKuis + ') tidak ditemukan saat update status email di Hasil_Kuis.');
  }

  return { ok: true, hasil: hasil, statusEmail: statusEmail };
}

function simpanHasil_(idKuis, namaKuis, nama, hasil) {
  const sheet = getSS_().getSheetByName(SHEET_HASIL);
  const k = hasil.kompetensi || {};
  sheet.appendRow([
    new Date(),
    idKuis,
    namaKuis,
    nama,
    hasil.skor,
    hasil.skorMaksimal,
    hasil.persentase,
    k.A || '', k.B || '', k.C || '', k.D || '', k.E || '', k.F || '',
    'Belum dikirim',
    ''
  ]);
}

// Mengembalikan true kalau baris ditemukan & berhasil di-update, false kalau tidak ketemu
// (supaya pemanggilnya bisa tahu dan mencatat peringatan, bukan gagal diam-diam).
function updateStatusEmail_(idKuis, nama, status) {
  const sheet = getSS_().getSheetByName(SHEET_HASIL);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === idKuis && String(data[i][3]).trim() === nama) {
      const baris = i + 1; // +1 karena getValues() 0-indexed, sheet 1-indexed
      sheet.getRange(baris, KOLOM_HASIL.indexOf('Status_Email_Ortu') + 1).setValue(status);
      sheet.getRange(baris, KOLOM_HASIL.indexOf('Waktu_Kirim_Email') + 1).setValue(new Date());
      return true;
    }
  }
  return false;
}

// Sheet Log_Email dibuat otomatis (beserta headernya) kalau belum ada, supaya
// pencatatan tidak pernah "hilang" secara diam-diam hanya karena sheet-nya lupa dibuat.
function catatLogEmail_(nama, idKuis, emailTujuan, status, pesanError) {
  let sheet = getSS_().getSheetByName(SHEET_LOG_EMAIL);
  if (!sheet) {
    sheet = getSS_().insertSheet(SHEET_LOG_EMAIL);
    sheet.appendRow(['Timestamp', 'Nama_Siswa', 'Email_Tujuan', 'ID_Kuis', 'Status', 'Pesan_Error']);
  }
  sheet.appendRow([new Date(), nama, emailTujuan, idKuis, status, pesanError]);
}

// ================= LANGKAH 4: KIRIM EMAIL VIA GOOGLE (MailApp) =================

function kirimEmailGoogle_(emailTujuan, namaSiswa, namaKuis, hasil) {
  const teksPolos =
    `Hasil Kuis ${namaKuis} — ${namaSiswa}\n\n` +
    `Skor: ${hasil.skor} / ${hasil.skorMaksimal} (${hasil.persentase})\n\n` +
    `Buka email ini di aplikasi/perangkat yang mendukung tampilan HTML untuk melihat ` +
    `rincian capaian per kemampuan yang diuji.\n\n` +
    `— ${NAMA_PENGIRIM}`;

  MailApp.sendEmail({
    to: emailTujuan,
    subject: `Hasil Kuis ${namaKuis} — ${namaSiswa}`,
    body: teksPolos,
    htmlBody: buatTemplateEmail_(namaSiswa, namaKuis, hasil),
    name: NAMA_PENGIRIM
  });
  // Catatan: MailApp.sendEmail akan melempar error otomatis kalau gagal
  // (mis. kuota harian habis, alamat tujuan tidak valid), sehingga blok
  // try/catch di submitKuis_ yang memanggil fungsi ini akan menangkapnya.
}

// Ubah teks "3/5" menjadi angka { benar:3, total:5, persen:60 }
function pecahNilaiKompetensi_(nilaiText) {
  if (!nilaiText || nilaiText.indexOf('/') === -1) return null;
  const bagian = nilaiText.split('/');
  const benar = parseInt(bagian[0], 10);
  const total = parseInt(bagian[1], 10);
  if (isNaN(benar) || isNaN(total) || total === 0) return null;
  return { benar: benar, total: total, persen: Math.round((benar / total) * 100) };
}

// Ubah huruf pertama jadi huruf kecil, supaya label kompetensi (yang aslinya
// diawali huruf besar untuk judul tabel) bisa disambung rapi ke tengah kalimat.
function lowerFirst_(teks) {
  if (!teks) return teks;
  return teks.charAt(0).toLowerCase() + teks.slice(1);
}

// Penanda capaian kualitatif berdasarkan persentase per kompetensi
function labelCapaian_(persen) {
  if (persen >= 80) return { teks: 'Sudah sangat baik', warna: '#0F6B5C', bg: '#E4F3EC' };
  if (persen >= 60) return { teks: 'Sudah cukup baik', warna: '#9A5F14', bg: '#FBEEDF' };
  return { teks: 'Perlu latihan lagi', warna: '#C24B3F', bg: '#FBEAE6' };
}

function buatTemplateEmail_(namaSiswa, namaKuis, hasil) {
  const tanggal = Utilities.formatDate(new Date(), 'GMT+7', "d MMMM yyyy");
  const kompetensi = hasil.kompetensi || {};

  // Pakai label kompetensi yang dikirim oleh halaman kuis (spesifik per mapel).
  // Kalau tidak dikirim (mis. halaman kuis versi lama), pakai cadangan.
  const labelKompetensi = (hasil.labelKompetensi && Object.keys(hasil.labelKompetensi).length)
    ? hasil.labelKompetensi
    : DEFAULT_LABEL_KOMPETENSI;

  // Kumpulkan data numerik tiap kompetensi untuk baris tabel & ringkasan otomatis
  const daftarKompetensi = Object.keys(labelKompetensi).map(function (kode) {
    const pecahan = pecahNilaiKompetensi_(kompetensi[kode]);
    return {
      kode: kode,
      label: labelKompetensi[kode],
      nilaiText: kompetensi[kode] || '-',
      persen: pecahan ? pecahan.persen : null
    };
  });

  const barisKompetensi = daftarKompetensi.map(function (k) {
    const capaian = k.persen !== null ? labelCapaian_(k.persen) : { teks: '-', warna: '#5B5D55', bg: '#F1EFE8' };
    return (
      '<tr>' +
      '<td style="padding:10px;border-bottom:1px solid #E3E0D6;font-size:13.5px;color:#23241F;">' + k.label + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #E3E0D6;font-size:13.5px;color:#0F6B5C;font-weight:700;text-align:center;white-space:nowrap;">' + k.nilaiText + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #E3E0D6;text-align:center;white-space:nowrap;">' +
      '<span style="background:' + capaian.bg + ';color:' + capaian.warna + ';font-size:11.5px;font-weight:700;padding:4px 9px;border-radius:999px;">' + capaian.teks + '</span>' +
      '</td>' +
      '</tr>'
    );
  }).join('');

  // Ringkasan otomatis: kompetensi paling kuat & yang paling perlu dilatih
  const kompetensiTerukur = daftarKompetensi.filter(function (k) { return k.persen !== null; });
  let paragrafRingkasan = '';
  if (kompetensiTerukur.length > 0) {
    const terkuat = kompetensiTerukur.slice().sort(function (a, b) { return b.persen - a.persen; })[0];
    const terlemah = kompetensiTerukur.slice().sort(function (a, b) { return a.persen - b.persen; })[0];
    if (terkuat.kode === terlemah.kode || terkuat.persen === terlemah.persen) {
      paragrafRingkasan = `Secara umum, capaian ananda cukup merata di seluruh kemampuan yang diuji pada materi Bunyi.`;
    } else {
      paragrafRingkasan =
        `Capaian ananda paling kuat pada kemampuan <b>${lowerFirst_(terkuat.label)}</b>. ` +
        `Sementara itu, kemampuan <b>${lowerFirst_(terlemah.label)}</b> masih bisa didampingi lebih lanjut di rumah.`;
    }
  }

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#23241F;">
    <div style="background:#0F6B5C;color:#F4FBF9;padding:20px 22px;border-radius:10px 10px 0 0;">
      <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;opacity:.85;">SD Muhammadiyah 01 Kukusan</div>
      <div style="font-size:18px;font-weight:700;margin-top:4px;">Laporan Hasil Kuis Siswa</div>
    </div>
    <div style="border:1px solid #E3E0D6;border-top:none;border-radius:0 0 10px 10px;padding:22px;">
      <p style="font-size:14px;line-height:1.6;">Kepada Bapak/Ibu Orang Tua/Wali dari <b>${namaSiswa}</b>,</p>
      <p style="font-size:14px;line-height:1.6;">
        Kami sampaikan bahwa pada tanggal <b>${tanggal}</b>, ananda <b>${namaSiswa}</b> telah mengerjakan
        kuis latihan <b>${namaKuis}</b> sebagai bagian dari evaluasi pemahaman materi secara berkala di kelas.
      </p>

      <div style="background:#FAF9F5;border:1px solid #E3E0D6;border-radius:10px;padding:16px 18px;margin:18px 0;text-align:center;">
        <div style="font-size:12px;color:#5B5D55;text-transform:uppercase;letter-spacing:.04em;">Skor</div>
        <div style="font-size:28px;font-weight:800;color:#0F6B5C;margin-top:2px;">${hasil.skor} / ${hasil.skorMaksimal}</div>
        <div style="font-size:13px;color:#5B5D55;margin-top:2px;">(${hasil.persentase})</div>
      </div>

      <p style="font-size:14px;line-height:1.6;margin-bottom:8px;">
        Kuis ini mengukur enam kemampuan yang sudah dipelajari ananda pada materi Bunyi, mulai dari bagaimana
        bunyi terjadi, bagaimana proses telinga mendengarnya, bagaimana bunyi merambat, sampai hasil eksperimen
        sederhana yang dilakukan di kelas. Berikut rinciannya:
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="padding:0 10px 6px;font-size:11px;color:#9A9C93;text-transform:uppercase;letter-spacing:.03em;">Kemampuan yang diuji</td>
          <td style="padding:0 10px 6px;font-size:11px;color:#9A9C93;text-transform:uppercase;letter-spacing:.03em;text-align:center;">Skor</td>
          <td style="padding:0 10px 6px;font-size:11px;color:#9A9C93;text-transform:uppercase;letter-spacing:.03em;text-align:center;">Capaian</td>
        </tr>
        ${barisKompetensi}
      </table>

      ${paragrafRingkasan ? '<p style="font-size:14px;line-height:1.6;">' + paragrafRingkasan + '</p>' : ''}

      <p style="font-size:14px;line-height:1.6;">
        Hasil ini bersifat sebagai <i>latihan dan evaluasi berkala</i>, bukan nilai ujian resmi,
        sehingga dapat dijadikan bahan diskusi dan pendampingan belajar ananda di rumah.
      </p>
      <p style="font-size:14px;line-height:1.6;">
        Terima kasih atas kerja sama dan dukungan Bapak/Ibu dalam mendampingi proses belajar ananda di rumah.
      </p>
      <p style="font-size:14px;line-height:1.6;margin-top:20px;">
        Hormat kami,<br>
        <b>SD Muhammadiyah 01 Kukusan</b>
      </p>
    </div>
    <p style="font-size:11px;color:#9A9C93;text-align:center;margin-top:14px;">
      Email ini dikirim otomatis oleh sistem kuis sekolah dan tidak perlu dibalas.
    </p>
  </div>`;
}

// ================= LANGKAH 5: RIWAYAT KUIS (LIVE, untuk halaman riwayat-kuis) =================

/**
 * Dipanggil oleh riwayat-kuis/index.html lewat
 * WEBAPP_URL + '?action=riwayatKuis' (GET, sama seperti daftarSiswa).
 *
 * Mengembalikan submission TERBARU per (siswa, kuis) — bukan seluruh
 * riwayat percobaan — supaya bentuknya sama persis dengan yang dipakai
 * halaman riwayat-kuis. Akun NAMA_AKUN_TES ("Tes Sistem") selalu
 * dikecualikan dari daftar siswa maupun dari hasil.
 *
 * Bentuk hasil:
 * {
 *   ok: true,
 *   siswa: ["Nama A", "Nama B", ...],               // urut abjad, tanpa akun tes
 *   kuis: [{ id, mapel, materi }, ...],              // dari sheet Daftar_Kuis
 *   hasil: {
 *     "<ID_KUIS>": {
 *       "<Nama Siswa>": { skor, skorMax, tanggal }   // hanya submission terbaru
 *     }
 *   }
 * }
 */
function ambilRiwayatKuis_() {
  const ss = getSS_();

  // --- Daftar siswa (tanpa akun tes) ---
  const dataSiswa = ss.getSheetByName(SHEET_SISWA).getDataRange().getValues();
  const siswa = [];
  for (let i = 1; i < dataSiswa.length; i++) {
    const nama = dataSiswa[i][0] ? String(dataSiswa[i][0]).trim() : '';
    if (nama && nama !== NAMA_AKUN_TES) siswa.push(nama);
  }
  siswa.sort();

  // --- Daftar kuis ---
  const dataKuis = ss.getSheetByName(SHEET_DAFTAR_KUIS).getDataRange().getValues();
  const kuis = [];
  for (let i = 1; i < dataKuis.length; i++) {
    const id = dataKuis[i][0] ? String(dataKuis[i][0]).trim() : '';
    if (!id) continue;
    kuis.push({ id: id, mapel: dataKuis[i][2], materi: dataKuis[i][1] });
  }

  // --- Hasil terbaru per (siswa, kuis), tanpa akun tes ---
  const dataHasil = ss.getSheetByName(SHEET_HASIL).getDataRange().getValues();
  const terbaru = {}; // key: idKuis + '||' + nama -> { skor, skorMax, ts }
  for (let i = 0; i < dataHasil.length; i++) {
    const baris = dataHasil[i];
    const nama = baris[3] ? String(baris[3]).trim() : '';
    if (!nama || nama === NAMA_AKUN_TES) continue;

    const idKuis = String(baris[1]).trim();
    const tsMentah = baris[0];
    const ts = tsMentah instanceof Date ? tsMentah : new Date(tsMentah);
    const key = idKuis + '||' + nama;

    if (!terbaru[key] || ts > terbaru[key].ts) {
      terbaru[key] = { skor: Number(baris[4]), skorMax: Number(baris[5]), ts: ts };
    }
  }

  const hasil = {};
  kuis.forEach(function (k) { hasil[k.id] = {}; });
  Object.keys(terbaru).forEach(function (key) {
    const idxPemisah = key.indexOf('||');
    const idKuis = key.slice(0, idxPemisah);
    const nama = key.slice(idxPemisah + 2);
    if (!hasil[idKuis]) hasil[idKuis] = {};
    const v = terbaru[key];
    hasil[idKuis][nama] = {
      skor: v.skor,
      skorMax: v.skorMax,
      tanggal: formatTanggalIndo_(v.ts)
    };
  });

  return { ok: true, siswa: siswa, kuis: kuis, hasil: hasil };
}

function formatTanggalIndo_(d) {
  const bulan = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return d.getDate() + ' ' + bulan[d.getMonth() + 1] + ' ' + d.getFullYear();
}


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



/**
 * Dipanggil dari halaman HTML setup (POST action=setupLatihan).
 * body: { tokenSetup: string } — harus sama dengan GURU_TOKEN di bawah.
 * Membuat 3 sheet latihan + header.
 */
const GURU_TOKEN = 'guru-sdm01-2026'; // sandi area guru — ganti setelah deploy


function loginGuru_(body) {
  const sandi = String((body && body.sandi) || '').trim();
  if (!sandi) {
    return { ok: false, pesan: 'Sandi wajib diisi.' };
  }
  if (sandi !== GURU_TOKEN) {
    return { ok: false, pesan: 'Sandi salah.' };
  }
  return { ok: true, pesan: 'Login guru berhasil.' };
}

function setupLatihanDariWeb_(body) {
  const token = String((body && (body.tokenSetup || body.sandi)) || '').trim();
  if (token !== GURU_TOKEN) {
    return { ok: false, pesan: 'Sandi guru salah.' };
  }
  const hasil = setupSheetLatihan_();
  return { ok: true, pesan: 'Sheet latihan siap.', detail: hasil };
}

/**
 * Impor baris bank soal dari halaman HTML.
 * body: { tokenSetup, rows: [ { ID_Soal, Mapel, ... }, ... ] }
 * Maksimal disarankan ~50 baris per request agar tidak timeout.
 */
function importBankSoalDariWeb_(body) {
  const token = String((body && (body.tokenSetup || body.sandi)) || '').trim();
  if (token !== GURU_TOKEN) {
    return { ok: false, pesan: 'Sandi guru salah.' };
  }
  const rows = (body && body.rows) || [];
  if (!rows.length) {
    return { ok: false, pesan: 'Tidak ada baris soal.' };
  }
  return importBankSoalRows_(rows);
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

/**
 * Impor baris bank soal.
 * Cara 1 (paling praktis): jalankan importBankSoalDariCsv_() setelah
 * menempelkan CSV di sheet sementara "Import_Bank_Staging" (lihat fungsi itu).
 * Cara 2: panggil importBankSoalRows_(arrayOfObjects) dari skrip lain.
 *
 * Setiap objek rows: { ID_Soal, Mapel, Materi, ... } sesuai KOLOM_BANK_SOAL.
 * Baris dengan ID_Soal yang sudah ada akan DILEWATI (tidak duplikat).
 */
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
      typeof (r.Opsi_JSON || r.opsi) === 'string'
        ? (r.Opsi_JSON || r.opsi)
        : JSON.stringify(r.Opsi_JSON || r.opsi || []),
      typeof (r.Kunci_JSON || r.kunci) === 'string'
        ? (r.Kunci_JSON || r.kunci)
        : JSON.stringify(r.Kunci_JSON || r.kunci || []),
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
    sheet.getRange(sheet.getLastRow() + 1, 1, buffer.length, KOLOM_BANK_SOAL.length)
      .setValues(buffer);
  }
  const msg = 'Impor selesai. Ditambah: ' + added + ', dilewati (duplikat/kosong): ' + skipped;
  Logger.log(msg);
  return { ok: true, added: added, skipped: skipped, pesan: msg };
}

/**
 * Impor dari sheet staging.
 * 1. Buat sheet bernama Import_Bank_Staging
 * 2. Baris 1 = header sama dengan Bank_Soal (atau minimal ID_Soal, Mapel, Materi, ...)
 * 3. Tempel data (mis. dari CSV)
 * 4. Run fungsi ini dari editor
 * 5. Hapus sheet staging setelah sukses (opsional)
 */
function importBankSoalDariStaging_() {
  const ss = getSS_();
  const staging = ss.getSheetByName('Import_Bank_Staging');
  if (!staging) {
    const pesan = 'Sheet Import_Bank_Staging belum ada. Buat sheet itu, isi header + data, lalu jalankan lagi.';
    Logger.log(pesan);
    return { ok: false, pesan: pesan };
  }
  const values = staging.getDataRange().getValues();
  if (values.length < 2) {
    return { ok: false, pesan: 'Staging kosong (perlu header + minimal 1 baris data).' };
  }
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

// -------------------- Endpoint LATIHAN --------------------

function ambilDaftarLatihan_() {
  const sheet = getSS_().getSheetByName(SHEET_DAFTAR_LATIHAN);
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: true, latihan: [] };
  }
  const data = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][11] || '').trim().toLowerCase(); // Status
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
  if (!info) {
    return { ok: false, pesan: 'Latihan tidak ditemukan. Hubungi guru.' };
  }
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
    if (String(data[i][1] || '').trim() === idLatihan && String(data[i][3] || '').trim() === nama) {
      n++;
    }
  }
  return n;
}

/**
 * Ambil soal untuk satu sesi latihan.
 * Response ke klien TIDAK menyertakan kunci (Kunci_JSON) — penilaian
 * bisa tetap di sisi HTML dengan kunci yang di-embed di halaman (pola kuis),
 * atau nanti dipindah ke server. Untuk latihan, kunci ikut di response
 * internal hanya jika parameter sertakanKunci=true (dipakai halaman skor).
 *
 * GET ?action=soalLatihan&idLatihan=LAT-...
 */
function ambilSoalLatihan_(idLatihan, sertakanKunci) {
  const info = ambilInfoLatihan_(idLatihan);
  if (!info) {
    return { ok: false, pesan: 'Latihan tidak ditemukan.' };
  }
  if (String(info.status || '').trim().toLowerCase() !== 'aktif') {
    return { ok: false, pesan: 'Latihan tidak aktif.' };
  }
  const ids = info.idSoalList;
  if (!ids.length) {
    return { ok: false, pesan: 'Latihan belum punya daftar soal.' };
  }

  const sheet = getSS_().getSheetByName(SHEET_BANK_SOAL);
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: false, pesan: 'Bank soal kosong.' };
  }
  const data = sheet.getDataRange().getValues();
  const byId = {};
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0] || '').trim();
    if (!id) continue;
    const status = String(data[i][14] || 'aktif').trim().toLowerCase();
    if (status && status !== 'aktif') continue;
    let opsi = [];
    let kunci = [];
    try { opsi = JSON.parse(data[i][7] || '[]'); } catch (e) { opsi = []; }
    try { kunci = JSON.parse(data[i][8] || '[]'); } catch (e) { kunci = []; }
    // Mode latihan: kunci ikut dikirim agar penilaian bisa di sisi halaman
    // (pola sama dengan kuis harian). Bukan level keamanan ujian resmi.
    const soal = {
      id: id,
      mapel: data[i][1],
      materi: data[i][2],
      subMateri: data[i][3],
      tipe: data[i][4],
      kompleksitas: data[i][5],
      pertanyaan: data[i][6],
      opsi: opsi,
      kunci: kunci,
      pembahasan: data[i][9],
      skor: data[i][10] || 1,
      contextId: data[i][11] || null,
      contextJudul: data[i][12] || null,
      contextTeks: data[i][13] || null
    };
    byId[id] = soal;
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
      idLatihan: info.idLatihan,
      namaLatihan: info.namaLatihan,
      mapel: info.mapel,
      materi: info.materi,
      durasiMenit: info.durasiMenit
    },
    soal: soal,
    idHilang: hilang
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

  return {
    ok: true,
    hasil: hasil,
    percobaanKe: percobaanKe,
    statusEmail: statusEmail
  };
}

function simpanHasilLatihan_(info, nama, hasil, percobaanKe) {
  const ss = getSS_();
  pastikanSheetDenganHeader_(ss, SHEET_HASIL_LATIHAN, KOLOM_HASIL_LATIHAN);
  const sheet = ss.getSheetByName(SHEET_HASIL_LATIHAN);
  sheet.appendRow([
    new Date(),
    info.idLatihan,
    info.namaLatihan,
    nama,
    info.mapel,
    info.materi,
    percobaanKe,
    hasil.skor,
    hasil.skorMaksimal,
    hasil.persentase,
    hasil.detail ? JSON.stringify(hasil.detail) : '',
    'Belum dikirim',
    ''
  ]);
}

function updateStatusEmailLatihan_(idLatihan, nama, percobaanKe, status) {
  const sheet = getSS_().getSheetByName(SHEET_HASIL_LATIHAN);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  // Cari baris terakhir yang cocok (percobaan ini)
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1] || '').trim() === idLatihan &&
        String(data[i][3] || '').trim() === nama &&
        Number(data[i][6]) === Number(percobaanKe)) {
      const baris = i + 1;
      sheet.getRange(baris, 12).setValue(status); // Status_Email_Ortu
      sheet.getRange(baris, 13).setValue(new Date());
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
    '<p style="font-size:12px;color:#8A8C82;margin-top:32px;">— ' + NAMA_PENGIRIM + '</p>' +
    '</div>';

  MailApp.sendEmail({
    to: emailTujuan,
    subject: 'Hasil Latihan ' + namaLatihan + ' — ' + namaSiswa,
    body: teksPolos,
    htmlBody: html,
    name: NAMA_PENGIRIM
  });
}

/**
 * Riwayat latihan untuk halaman laporan / grafik.
 * Filter opsional: nama, mapel, materi, idLatihan.
 */
function ambilRiwayatLatihan_(filter) {
  filter = filter || {};
  const sheet = getSS_().getSheetByName(SHEET_HASIL_LATIHAN);
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: true, hasil: [] };
  }
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
      idLatihan: data[i][1],
      namaLatihan: data[i][2],
      namaSiswa: nama,
      mapel: mapel,
      materi: materi,
      percobaanKe: data[i][6],
      skor: data[i][7],
      skorMaksimal: data[i][8],
      persentase: data[i][9],
      statusEmail: data[i][11]
    });
  }
  return { ok: true, hasil: hasil };
}
