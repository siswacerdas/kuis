# Struktur folder — Kuis Digital SDM01KKS

```
kuis/
├── index.html              # Login siswa / guru
├── beranda.html            # Home siswa
├── progress.md             # Catatan progres
├── antiregresi.md          # Checklist sebelum publish
├── readme.md
│
├── assets/                 # CSS bersama
├── mapel/                  # Semua mata pelajaran
│   ├── ipas/
│   ├── bahasa-indonesia/
│   ├── matematika/
│   ├── pendidikan-pancasila/
│   └── seni-budaya/
│
├── latihan/                # Siswa: sesi ATS/AAS
├── riwayat/                # Riwayat kuis resmi
├── guru/                   # Panel guru (latihan + laporan)
│
├── bank-soal/              # Pool soal JSON
├── backend/                # Code.gs, Latihan.gs (referensi Apps Script)
├── docs/                   # Desain, panduan, draft
└── scripts/                # Helper upload
```

## Halaman aplikasi

| Path | Fungsi |
|------|--------|
| `index.html` | Login |
| `beranda.html` | Beranda siswa |
| `mapel/<mapel>/` | Daftar & halaman kuis per mapel |
| `latihan/` | Kerjakan sesi latihan |
| `riwayat/` | Riwayat nilai kuis resmi |
| `guru/` | Panel guru |

## Dokumentasi

| Path | Isi |
|------|-----|
| `docs/desain-sheet-latihan.md` | Desain sheet Bank_Soal / Daftar_Latihan / Hasil_Latihan |
| `docs/arsitektur-akses.md` | Arsitektur akses |
| `docs/UPLOAD-INSTRUKSI.md` | Panduan upload/deploy |
| `docs/draft/` | Draft soal (sumber kerja) |

## Redirect path lama (sudah dihapus)

| Lama | Baru |
|------|------|
| `ipas/` | `mapel/ipas/` |
| `bahasa-indonesia/` | `mapel/bahasa-indonesia/` |
| `matematika/` | `mapel/matematika/` |
| `pendidikan-pancasila/` | `mapel/pendidikan-pancasila/` |
| `seni-budaya/` | `mapel/seni-budaya/` |
| `riwayat-kuis/` | `riwayat/` |
| `pages/admin/` | dihapus (digantikan `guru/` + impor bank soal) |
