# Progress — Kuis Digital SDM01KKS

Catatan progres pengerjaan, disusun per fase supaya mudah dilanjutkan di sesi berikutnya.

## Status ringkas

| Fase | Deskripsi | Status |
|---|---|---|
| 1 | Halaman utama (`index.html`) + dokumen proyek | ✅ Selesai (2 Agu 2026) |
| 2 | Kuis Pendidikan Pancasila | ⬜ Belum mulai |
| 3 | Kuis Bahasa Indonesia | ⬜ Belum mulai |
| 4 | Kuis Matematika | ⬜ Belum mulai |
| 5 | Kuis IPAS | ⬜ Belum mulai |
| 6 | Kuis Seni Budaya (Seni Rupa & Seni Musik) | ⬜ Belum mulai |

---

## Fase 1 — Halaman utama (Selesai)

**Tanggal:** 2 Agustus 2026

**Yang dikerjakan:**
- Dibuat `index.html` mandiri (tanpa dependensi eksternal), mobile-first, adaptif ke tampilan PC mulai lebar 640px.
- Header berisi nama sekolah, nama aplikasi, dan kontrol ukuran tulisan (A− / A+) yang tersimpan lewat `localStorage`.
- Daftar 5 mata pelajaran ditampilkan sebagai kartu bergaya "tiket ujian" (garis putus-putus antar kartu), masing-masing dengan ikon kecil bertema mapel dan badge status.
- Semua kartu mapel masih berstatus **"Segera hadir"** (non-aktif) karena halaman kuis per mapel belum dibuat.
- Bagian "Cara mengerjakan" (3 langkah singkat) ditambahkan sebagai panduan siswa.
- Palet warna dibatasi: hijau tua sebagai warna brand, kuning keemasan sebagai aksen, warna per-mapel hanya dipakai pada ikon kecil — bukan latar kartu — supaya halaman tetap terasa tenang dan tidak ramai.
- Font memakai system font stack (tidak memuat font dari internet) untuk menjaga halaman tetap ringan di HP lama.
- Dibuat `readme.md`, `progress.md` (dokumen ini), dan `antiregresi.md`.

**Belum dikerjakan / catatan lanjutan:**
- Belum ada halaman kuis sungguhan untuk kelima mapel — kartu masih dummy/non-klik.
- Belum diuji langsung di perangkat HP fisik (baru diverifikasi lewat kode/CSS responsif).
- Struktur folder untuk halaman kuis per mapel belum ditentukan (perlu diputuskan: satu folder per mapel, atau satu file per babak/topik seperti pola di `cerdas-cermat`).
- Belum ada sistem penyimpanan skor/hasil kuis siswa.

---

## Fase 5b — Kuis IPAS kedua: Ekosistem (Aliran Energi & Simbiosis)

**Tanggal:** 7 September 2026

**Yang dikerjakan:**
- Ditambahkan kuis kedua untuk mapel IPAS: `ipas/ekosistem.html`, materi "Hubungan Timbal Balik & Aliran Energi" (Subunit 3: Rantai & Jaring-Jaring Makanan | Simbiosis), sumber `Presentation_Ekosistem.pdf`.
- Dibuat `ipas/draft-soal-ekosistem.md` sebagai arsip bank soal (20 soal, C1→C5, kompetensi A–F) beserta kunci jawaban dan pembahasan, mengikuti pola `draft-soal-bunyi.md`.
- File HTML dibangun dari pola `bahasa-indonesia/deskripsi.html` (versi terbaru, sudah termasuk `LABEL_KOMPETENSI_EMAIL` untuk laporan ke orang tua), `ID_KUIS = 'IPAS-EKOSISTEM-01'`, backend Apps Script sama seperti kuis lain.
- `ipas/index.html` diperbarui: kartu kuis "Ekosistem: Aliran Energi & Simbiosis" ditambahkan ke daftar "Kuis tersedia".
- `index.html` (halaman utama) diperbarui: badge IPAS dari "1 kuis tersedia" menjadi "2 kuis tersedia".
- Bank soal divalidasi otomatis (index jawaban, panjang array kategori/urutan, keanggotaan kode kompetensi) — tidak ditemukan error struktural.

**Belum dikerjakan / catatan lanjutan:**
- Token kuis untuk `IPAS-EKOSISTEM-01` perlu didaftarkan di backend Apps Script (Code.gs / sheet token) sebelum kuis bisa dipakai siswa — belum dicek dari sisi ini karena backend tidak termasuk dalam repo.
- Belum diuji langsung di perangkat/browser sungguhan — baru divalidasi lewat pengecekan struktur data JS.
- Checklist `antiregresi.md` belum dicentang manual sebelum publish ke siswa.

## Fase 3b — Kuis Bahasa Indonesia kedua: Jalinan Deskripsi dan Sebab-Akibat

**Tanggal:** 8 September 2026

**Yang dikerjakan:**
- Ditambahkan kuis kedua untuk mapel Bahasa Indonesia: `bahasa-indonesia/sebab-akibat.html`, materi "Jalinan Akrab Deskripsi dan Sebab-Akibat" (Subunit 2), sumber `Presentation_Sebab-Akibat.pdf`.
- File dibangun dari pola `deskripsi.html` (`ID_KUIS = 'BINDO-SEBABAKIBAT-01'`), 20 soal C1→C5 (3/5/6/3/3), 13 PG/2 PGK/2 Kategori/3 Urutan, dengan 6 kompetensi (A–F): konsep deskripsi & sebab-akibat, menemukan detail dari pengamatan, kata hubung sebab/akibat/pertentangan, menyusun kalimat penjelasan, menilai kekuatan penjelasan, dan menerapkan langkah amati-pikirkan-jelaskan.
- Bank soal divalidasi otomatis (index jawaban, panjang array kategori/urutan, keanggotaan kode kompetensi) — tidak ditemukan error struktural.
- **Bug lama ditemukan & diperbaiki**: `deskripsi.html` ternyata masih menyisakan teks layar hasil dari kuis Bunyi ("Kerja bagus sudah menyelesaikan kuis Bunyi.") — sudah diperbaiki di `deskripsi.html` maupun di file baru `sebab-akibat.html`.
- `bahasa-indonesia/index.html` diperbarui: kartu kuis "Jalinan Deskripsi dan Sebab-Akibat" ditambahkan.
- `index.html` (halaman utama) diperbarui: badge Bahasa Indonesia dari "1 kuis tersedia" menjadi "2 kuis tersedia".
- `riwayat-kuis/index.html` diperbarui: kuis baru ditambahkan ke data riwayat (status "Belum mengerjakan" untuk semua siswa karena belum ada yang mengerjakan).

**Belum dikerjakan / catatan lanjutan:**
- Token kuis untuk `BINDO-SEBABAKIBAT-01` perlu didaftarkan di backend Apps Script sebelum kuis bisa dipakai siswa.
- Belum diuji di HP/browser sungguhan, baru divalidasi struktur datanya.
- Checklist `antiregresi.md` belum dicentang manual sebelum publish ke siswa.

## Fase 5c — Riwayat Kuis jadi live (fetch dari backend, bukan snapshot statis)

**Tanggal:** 8 September 2026

**Yang dikerjakan:**
- Ditambahkan folder `backend/` berisi `Code.gs` (cermin/referensi backend Apps Script yang sebenarnya) dan `README.md` yang menjelaskan bahwa file ini tidak auto-deploy — perubahan tetap harus disalin manual ke editor Apps Script.
- Ditambahkan action baru `riwayatKuis` (GET) di `doGet()`, lewat fungsi baru `ambilRiwayatKuis_()`, yang membaca sheet `Nama_Siswa`, `Daftar_Kuis`, dan `Hasil_Kuis` secara langsung dan mengembalikan submission TERBARU per (siswa, kuis) sebagai JSON — akun "Tes Sistem" selalu dikecualikan. Tidak mengubah fungsi/action yang sudah ada (`daftarSiswa`, `mulaiKuis`, `submitKuis`).
- `riwayat-kuis/index.html` diubah total dari data ter-embed statis menjadi fetch live ke `WEBAPP_URL + '?action=riwayatKuis'` setiap halaman dibuka, dengan status "Memuat…" / "Data terbaru — dimuat pukul HH:MM" / pesan gagal, filter otomatis nonaktif saat memuat, dan tombol "Perbarui" untuk refresh manual tanpa reload halaman.
- Nama materi tetap ditampilkan ramah-baca lewat `MATERI_LABEL_OVERRIDE` di sisi client (menimpa Nama_Kuis mentah dari sheet); kuis baru yang belum didaftarkan di map ini tetap tampil apa adanya, tidak "hilang".
- Diuji dengan simulasi DOM (jsdom): skenario fetch berhasil (termasuk nilai 0 tetap tampil angka, bukan "Belum mengerjakan") dan skenario fetch gagal (pesan error + tombol "Coba lagi").

**Belum dikerjakan / catatan lanjutan:**
- Perubahan `Code.gs` di repo ini **belum otomatis aktif** — Arif perlu menyalin fungsi `ambilRiwayatKuis_()`, `formatTanggalIndo_()`, konstanta `NAMA_AKUN_TES`, dan baris baru di `doGet()` ke Apps Script editor sungguhan, lalu deploy ulang ("Manage deployments" → versi baru) sebelum halaman riwayat bisa memuat data live.
- Belum diuji terhadap backend Apps Script sungguhan (baru diuji dengan data tiruan/mock).

## Fase berikutnya (usulan urutan)

1. Tentukan dulu format soal kuis (pilihan ganda saja, atau campur isian singkat) dan skema datanya (mis. JSON per mapel) sebelum mulai membangun halaman kuis pertama.
2. Bangun 1 mapel percontohan dulu (disarankan: **Matematika** atau **Bahasa Indonesia**, sesuai kebutuhan Della) supaya polanya bisa dipakai ulang untuk mapel lain.
3. Setelah pola halaman kuis disepakati, aktifkan tautan dan badge di `index.html` satu per satu mengikuti mapel yang sudah jadi.
4. Setiap kali menyelesaikan satu fase, perbarui tabel status di atas dan tambahkan entri baru di bagian riwayat.

