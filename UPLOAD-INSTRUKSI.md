# Upload manual — file latihan ATS/AAS

File besar (Code.gs, halaman latihan, CSV bank soal) disiapkan di folder proyek lokal:
**`UPLOAD-SEKARANG/`**

## 1. Apps Script — hanya 1 file

1. Buka project: [script.google.com](https://script.google.com) → spreadsheet **Database_Kuis**
2. Buka file `Code.gs` di editor
3. **Ganti seluruh isi** dengan isi file lokal `UPLOAD-SEKARANG/Code.gs`
4. Simpan → **Deploy** → Manage deployments → pensil → **New version** → Deploy
5. Jalankan fungsi `setupSheetLatihan_` (dropdown + Run)

> Tidak perlu file `Latihan.gs` terpisah jika memakai Code.gs lengkap ini.

## 2. Halaman siswa — upload ke GitHub

**Link upload ke folder `latihan/`:**
https://github.com/siswacerdas/kuis/upload/main/latihan

- Pilih file lokal: `UPLOAD-SEKARANG/latihan-index.html`
- **Rename** saat upload menjadi: `index.html`
- Commit ke branch `main`

Atau drag-and-drop ke:
https://github.com/siswacerdas/kuis/tree/main

lalu buat folder `latihan` dan simpan sebagai `index.html`.

## 3. Spreadsheet

1. Run `setupSheetLatihan_` (membuat sheet Bank_Soal, Daftar_Latihan, Hasil_Latihan)
2. Impor `UPLOAD-SEKARANG/Bank_Soal_IPAS_import.csv` ke sheet **Bank_Soal**
3. Salin baris dari `UPLOAD-SEKARANG/Daftar_Latihan_contoh.csv` ke **Daftar_Latihan**
   - Token contoh: `LATIHAN1`

## 4. Link cepat GitHub

| Tujuan | URL |
|--------|-----|
| Upload file ke repo (root) | https://github.com/siswacerdas/kuis/upload/main |
| Upload ke `backend/` | https://github.com/siswacerdas/kuis/upload/main/backend |
| Upload ke `latihan/` | https://github.com/siswacerdas/kuis/upload/main/latihan |
| Edit Code.gs yang ada | https://github.com/siswacerdas/kuis/edit/main/backend/Code.gs |
| Lihat Latihan.gs (sudah di repo) | https://github.com/siswacerdas/kuis/blob/main/backend/Latihan.gs |
| Beranda kuis (Pages) | sesuaikan URL GitHub Pages kamu + `/latihan/` |

## Checklist

- [ ] Code.gs diganti + Deploy New version
- [ ] setupSheetLatihan_ dijalankan
- [ ] Bank soal diimpor
- [ ] Daftar_Latihan diisi
- [ ] latihan/index.html di repo
- [ ] Uji halaman latihan dengan token LATIHAN1
