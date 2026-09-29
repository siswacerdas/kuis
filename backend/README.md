# Backend (Google Apps Script)

`Code.gs` di folder ini adalah **cermin/referensi** dari kode yang berjalan di
Google Apps Script project yang terhubung ke Spreadsheet `Database_Kuis`
(ID: `1jT4Lbqkg7YfnGcS7OH5mHBWrJ7k4V23Vz5DobKrX1U0`).

**Penting:** menyimpan file ini di repo **tidak otomatis men-deploy**.
Setiap perubahan harus **disalin manual** ke editor Apps Script, lalu
di-deploy ulang lewat "Manage deployments".

## Aksi yang tersedia

### Kuis resmi

| Method | `action` | Keterangan |
|---|---|---|
| GET | `daftarSiswa` | Daftar nama siswa |
| GET | `riwayatKuis` | Riwayat kuis live |
| GET | `cekStatusKuis` | Cek sudah mengerjakan |
| POST | `mulaiKuis` | Validasi token kuis |
| POST | `submitKuis` | Simpan hasil + email ortu |

### Latihan (ATS/AAS)

| Method | `action` | Keterangan |
|---|---|---|
| GET | `daftarLatihan` | Sesi latihan aktif |
| GET | `soalLatihan` | Soal by `idLatihan` |
| GET | `riwayatLatihan` | Filter nama/mapel/materi |
| POST | `mulaiLatihan` | Validasi token latihan |
| POST | `submitLatihan` | Simpan Hasil_Latihan + email |

### Fungsi manual (Run di editor)

- `setupSheetLatihan_()` — buat sheet Bank_Soal, Daftar_Latihan, Hasil_Latihan
- `importBankSoalDariStaging_()` — impor dari sheet Import_Bank_Staging
- `tesKirimEmail()` — tes MailApp

Lihat juga: panduan deploy di artifacts dan `docs/desain-sheet-latihan.md`.
