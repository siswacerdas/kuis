# Isi paket ini

## 📁 kuis/
Struktur PERSIS seperti repo GitHub `siswacerdas/kuis`. Salin/timpa seluruh isi
folder ini ke dalam repo Della (root repo = isi folder `kuis/` ini, bukan folder
`kuis/`-nya itu sendiri yang dipindah).

- index.html                    → halaman utama (daftar mata pelajaran)
- readme.md, progress.md, antiregresi.md
- ipas/index.html                → landing mapel IPAS (daftar kuis)
- ipas/bunyi.html                → kuis Bunyi (SUDAH terisi URL Web App)
- ipas/draft-soal-bunyi.md       → draf 20 soal (referensi, bukan bagian tampilan)
- pendidikan-pancasila/index.html, bahasa-indonesia/index.html,
  matematika/index.html, seni-budaya/index.html  → halaman "segera hadir"

## 📁 backend-dan-panduan/
BUKAN bagian dari repo GitHub. Ini referensi kerja Della:

- Code.gs                    → isi untuk ditempel di Apps Script (Extensions → Apps Script)
- PANDUAN_SETUP.md           → langkah pasang Apps Script + Brevo
- Database_Kuis_draft.xlsx   → contoh struktur sheet (Nama_Siswa, Daftar_Kuis, Hasil_Kuis, Log_Email)

## Yang perlu diisi URL Web App
Hanya SATU file: kuis/ipas/bunyi.html — dan itu sudah saya isikan.
File index.html lainnya tidak memanggil backend sama sekali.
