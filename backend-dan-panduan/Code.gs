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
 *   4. Mengirim email hasil ke orang tua lewat Brevo
 *
 * Della TIDAK PERLU mengedit bagian tengah (fungsi-fungsi ber-
 * awalan huruf kecil). Yang perlu disesuaikan hanya bagian
 * KONFIGURASI di bawah ini, dan Script Properties (lihat
 * PANDUAN_SETUP.md).
 * ============================================================
 */

// ================= KONFIGURASI (boleh diubah) =================

const SPREADSHEET_ID = '1jT4Lbqkg7YfnGcS7OH5mHBWrJ7k4V23Vz5DobKrX1U0';

const SHEET_SISWA = 'Nama_Siswa';
const SHEET_DAFTAR_KUIS = 'Daftar_Kuis';
const SHEET_HASIL = 'Hasil_Kuis';
const SHEET_LOG_EMAIL = 'Log_Email';

// Email pengirim HARUS sudah diverifikasi/di-approve di Brevo
// (Senders, Domains & Dedicated IPs > Senders).
const BREVO_SENDER_EMAIL = 'ganti-dengan-email-pengirim@domain-sekolah.sch.id';
const BREVO_SENDER_NAME = 'SD Muhammadiyah 01 Kukusan';

// Kolom pada sheet Hasil_Kuis (urutan HARUS sama dengan header di spreadsheet)
const KOLOM_HASIL = [
  'Timestamp', 'ID_Kuis', 'Nama_Kuis', 'Nama_Siswa', 'Skor', 'Skor_Maksimal',
  'Persentase', 'Kompetensi_A', 'Kompetensi_B', 'Kompetensi_C', 'Kompetensi_D',
  'Kompetensi_E', 'Kompetensi_F', 'Status_Email_Ortu', 'Waktu_Kirim_Email'
];

// Label kompetensi yang tampil di email orang tua (silakan ubah teksnya
// kalau perlu, TAPI jangan ubah key A–F nya)
const LABEL_KOMPETENSI = {
  A: 'Memahami bagaimana bunyi terjadi dan dihasilkan, yaitu melalui getaran benda',
  B: 'Memahami proses hingga manusia dapat mendengar bunyi, mulai dari bagian-bagian telinga',
  C: 'Memahami proses bunyi merambat sampai ke telinga, melalui benda padat, cair, dan gas',
  D: 'Membandingkan dan menyimpulkan efektivitas benda padat, cair, dan gas dalam menghantarkan bunyi',
  E: 'Memahami hasil eksperimen pengujian rambatan bunyi (lewat meja, air, dan udara)',
  F: 'Memahami proses dan cara kerja eksperimen pembuatan telepon kaleng/gelas plastik dengan benang'
};

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
  } finally {
    lock.releaseLock();
  }

  // Kirim email ke orang tua. Kalau gagal, hasil kuis siswa TETAP tersimpan —
  // kegagalan email tidak boleh membuat siswa kehilangan hasilnya.
  let statusEmail = 'Belum dikirim';
  try {
    const emailOrtu = ambilEmailOrtu_(nama);
    if (!emailOrtu) {
      statusEmail = 'Email ortu belum diisi';
    } else {
      kirimEmailBrevo_(emailOrtu, nama, cek.kuis.namaKuis, hasil);
      statusEmail = 'Terkirim';
    }
  } catch (err) {
    statusEmail = 'Gagal terkirim';
    catatLogEmail_(nama, idKuis, ambilEmailOrtu_(nama), 'Gagal', String(err.message || err));
  }
  updateStatusEmail_(idKuis, nama, statusEmail);

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

function updateStatusEmail_(idKuis, nama, status) {
  const sheet = getSS_().getSheetByName(SHEET_HASIL);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === idKuis && String(data[i][3]).trim() === nama) {
      const baris = i + 1; // +1 karena getValues() 0-indexed, sheet 1-indexed
      sheet.getRange(baris, KOLOM_HASIL.indexOf('Status_Email_Ortu') + 1).setValue(status);
      sheet.getRange(baris, KOLOM_HASIL.indexOf('Waktu_Kirim_Email') + 1).setValue(new Date());
      return;
    }
  }
}

function catatLogEmail_(nama, idKuis, emailTujuan, status, pesanError) {
  const sheet = getSS_().getSheetByName(SHEET_LOG_EMAIL);
  if (!sheet) return; // sheet log opsional, boleh tidak ada
  sheet.appendRow([new Date(), nama, emailTujuan, idKuis, status, pesanError]);
}

// ================= LANGKAH 4: KIRIM EMAIL VIA BREVO =================

function kirimEmailBrevo_(emailTujuan, namaSiswa, namaKuis, hasil) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY');
  if (!apiKey) {
    throw new Error('BREVO_API_KEY belum diatur di Script Properties.');
  }

  const payload = {
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: [{ email: emailTujuan }],
    subject: `Hasil Kuis ${namaKuis} — ${namaSiswa}`,
    htmlContent: buatTemplateEmail_(namaSiswa, namaKuis, hasil)
  };

  const response = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'api-key': apiKey, accept: 'application/json' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const kode = response.getResponseCode();
  if (kode < 200 || kode >= 300) {
    throw new Error('Brevo menolak permintaan (kode ' + kode + '): ' + response.getContentText());
  }
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

  // Kumpulkan data numerik tiap kompetensi untuk baris tabel & ringkasan otomatis
  const daftarKompetensi = Object.keys(LABEL_KOMPETENSI).map(function (kode) {
    const pecahan = pecahNilaiKompetensi_(kompetensi[kode]);
    return {
      kode: kode,
      label: LABEL_KOMPETENSI[kode],
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
