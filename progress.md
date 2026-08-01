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

## Fase berikutnya (usulan urutan)

1. Tentukan dulu format soal kuis (pilihan ganda saja, atau campur isian singkat) dan skema datanya (mis. JSON per mapel) sebelum mulai membangun halaman kuis pertama.
2. Bangun 1 mapel percontohan dulu (disarankan: **Matematika** atau **Bahasa Indonesia**, sesuai kebutuhan Della) supaya polanya bisa dipakai ulang untuk mapel lain.
3. Setelah pola halaman kuis disepakati, aktifkan tautan dan badge di `index.html` satu per satu mengikuti mapel yang sudah jadi.
4. Setiap kali menyelesaikan satu fase, perbarui tabel status di atas dan tambahkan entri baru di bagian riwayat.

