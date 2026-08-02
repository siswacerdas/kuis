# Panduan Setup Backend Kuis (Apps Script + Brevo)

Ikuti urutan ini pelan-pelan. Setiap langkah kecil, jangan lompat.

## 1. Buka spreadsheet & buat sheet-sheet yang dibutuhkan

1. Buka spreadsheet Della dengan ID `1jT4Lbqkg7YfnGcS7OH5mHBWrJ7k4V23Vz5DobKrX1U0`.
2. Kalau belum ada, buat 4 sheet dengan nama **persis** seperti ini (huruf besar/kecil dan garis bawah harus sama):
   - `Nama_Siswa` (sudah ada — tambahkan kolom **B** berjudul `Email Orang Tua`, isi emailnya per siswa)
   - `Daftar_Kuis`
   - `Hasil_Kuis`
   - `Log_Email` (opsional, boleh dilewati dulu)
3. Struktur kolom lengkapnya sudah saya siapkan di file `Database_Kuis_draft.xlsx` yang saya kirim sebelumnya — tinggal salin header dan contoh barisnya ke spreadsheet asli, lalu hapus baris contoh (yang tulisannya abu-abu miring).
4. Di sheet `Daftar_Kuis`, isi 1 baris untuk kuis Bunyi ini, contoh:

   | ID_Kuis | Nama_Kuis | Mapel | Jumlah_Soal | Durasi_Menit | Token_Aktif | Status |
   |---|---|---|---|---|---|---|
   | IPAS-BUNYI-01 | Kuis IPAS - Bunyi | IPAS | 20 | 30 | *(tulis token bebas, contoh:* `BUNYI25`*)* | Aktif |

   Token inilah yang nanti ditulis guru di papan tulis saat kuis berlangsung.

## 2. Pasang script ke spreadsheet

1. Di spreadsheet, klik menu **Extensions (Ekstensi) → Apps Script**.
2. Akan terbuka tab baru berisi editor kode. Hapus semua isi default (`function myFunction() {}`).
3. Buka file `Code.gs` yang saya buatkan, salin seluruh isinya, tempel ke editor Apps Script.
4. Di bagian atas file (`KONFIGURASI`), cek:
   - `SPREADSHEET_ID` sudah sesuai (harusnya otomatis benar karena saya isi dari ID yang Della berikan).
   - `BREVO_SENDER_EMAIL` — **ganti** dengan email pengirim yang sudah Della daftarkan/verifikasi di Brevo (Brevo → Senders, Domains & Dedicated IPs → Senders). Kalau kirim pakai email yang belum diverifikasi, Brevo akan menolak.
5. Klik ikon disket (Save project).

## 3. Simpan API key Brevo dengan aman (Script Properties)

1. Masih di editor Apps Script, klik ikon **⚙️ Project Settings** di sisi kiri.
2. Scroll ke bagian **Script Properties**, klik **Add script property**.
3. Isi:
   - Property: `BREVO_API_KEY`
   - Value: *(tempel API key Brevo yang sudah diambil sebelumnya)*
4. Klik **Save script properties**.

Dengan cara ini, API key tidak pernah muncul di kode dan tidak akan ikut ter-copy kalau suatu saat kode dibagikan.

## 4. Deploy sebagai Web App

1. Klik tombol biru **Deploy → New deployment** di kanan atas.
2. Klik ikon gerigi di sebelah "Select type", pilih **Web app**.
3. Isi:
   - Description: `Backend Kuis SDM01KKS`
   - Execute as: **Me (email Della)**
   - Who has access: **Anyone** *(supaya siswa yang belum login Google pun bisa memakainya)*
4. Klik **Deploy**.
5. Google akan minta izin akses (authorize) — ikuti saja, klik akun Della, lalu "Advanced/Lanjutan" → "Go to (nama project) (unsafe)" kalau muncul peringatan (ini normal untuk script buatan sendiri, bukan tanda bahaya).
6. Setelah selesai, akan muncul **Web app URL** — bentuknya seperti:
   `https://script.google.com/macros/s/xxxxxxxxxxxxx/exec`
   **Salin dan simpan URL ini** — inilah alamat yang nanti dipasang di halaman HTML kuis supaya bisa "bicara" dengan spreadsheet.

## 5. Uji coba cepat (sebelum HTML kuis jadi)

Supaya yakin script-nya jalan sebelum kita lanjut ke HTML:

1. Buka URL Web App tadi, tambahkan `?action=daftarSiswa` di belakangnya, contoh:
   `https://script.google.com/macros/s/xxxxxxxxxxxxx/exec?action=daftarSiswa`
2. Buka di browser. Kalau berhasil, akan muncul teks JSON berisi daftar nama siswa dari sheet `Nama_Siswa`. Kalau muncul pesan error, screenshot saja dan kirim ke saya, nanti kita telusuri bersama.

## Catatan penting

- **Setiap kali mengubah isi `Code.gs`**, Della perlu **Deploy → Manage deployments → ikon pensil → Version: New version → Deploy** lagi supaya perubahan aktif. Menyimpan kode saja (ikon disket) tidak otomatis memperbarui Web App yang sedang berjalan.
- URL Web App yang sama bisa dipakai terus untuk kuis-kuis lain nanti — cukup tambah baris baru di `Daftar_Kuis` dengan `ID_Kuis` berbeda.
- Kalau nanti Web App URL dipasang di HTML dan ternyata gagal terhubung (error CORS di console browser), beri tahu saya — ada penyesuaian kecil cara `fetch` di HTML supaya cocok dengan Apps Script (biasanya soal `Content-Type` di request).

## Langkah selanjutnya

Kalau bagian 1–5 di atas sudah berhasil dan `daftarSiswa` sudah menampilkan nama-nama siswa dengan benar, beri tahu saya — kita lanjut membangun halaman `ipas/bunyi.html`, yaitu halaman kuis sungguhan (login nama, token, timer, navigasi soal, sampai hasil), yang akan memanggil Web App URL ini.
