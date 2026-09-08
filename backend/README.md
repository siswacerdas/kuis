# Backend (Google Apps Script)

`Code.gs` di folder ini adalah **cermin/referensi** dari kode yang berjalan di
Google Apps Script project yang terhubung ke Spreadsheet `Database_Kuis`
(ID: `1jT4Lbqkg7YfnGcS7OH5mHBWrJ7k4V23Vz5DobKrX1U0`).

**Penting:** menyimpan file ini di repo **tidak otomatis men-deploy**
perubahan apa pun — Apps Script tidak membaca dari GitHub/repo ini. Setiap
kali `Code.gs` di sini diperbarui, perubahan yang sama harus **disalin manual**
ke editor Apps Script (script.google.com), lalu di-deploy ulang lewat
"Manage deployments" agar aktif di URL Web App yang dipakai semua halaman
kuis (`WEBAPP_URL`).

File ini disimpan supaya:
1. Ada riwayat/versi dari sisi backend, sinkron dengan histori sisi frontend di repo ini.
2. Saat perlu menambah fitur baru yang butuh perubahan backend (mis. endpoint
   baru), perubahan bisa direncanakan berdasarkan kode yang benar-benar
   berjalan, bukan tebakan.

## Aksi yang tersedia

| Method | `action` | Dipanggil dari | Keterangan |
|---|---|---|---|
| GET | `daftarSiswa` | Semua halaman kuis (layar masuk) | Daftar nama siswa untuk dropdown |
| GET | `riwayatKuis` | `riwayat-kuis/index.html` | Data riwayat kuis live (siswa, daftar kuis, hasil terbaru per siswa), akun "Tes Sistem" dikecualikan |
| POST | `mulaiKuis` | Semua halaman kuis (tombol "Mulai Kuis") | Validasi token & cek belum pernah mengerjakan |
| POST | `submitKuis` | Semua halaman kuis (tombol "Selesai & Kumpulkan") | Simpan hasil ke sheet `Hasil_Kuis` + kirim email ke orang tua |
