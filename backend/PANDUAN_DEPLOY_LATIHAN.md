# Panduan Deploy Code.gs + Setup Sheet Latihan

## 1. Deploy Code.gs

1. Buka [script.google.com](https://script.google.com) → project yang terhubung ke spreadsheet **Database_Kuis**.
2. Ganti seluruh isi editor dengan file `backend/Code.gs` (dari repo).
3. Jika ada file `backend/Latihan.gs`, tambahkan sebagai file skrip kedua di project yang sama (File → + → Script).
4. Simpan (Ctrl/Cmd+S).
5. **Deploy** → Manage deployments → Edit (pensil) → New version → Deploy.
6. Pastikan URL Web App yang dipakai halaman kuis tidak berubah (Same deployment).

> Kuis resmi tetap berjalan. Endpoint baru hanya menambah action latihan.

## 2. Buat 3 sheet baru (sekali saja)

Di editor Apps Script:

1. Pilih fungsi `setupSheetLatihan_` di dropdown.
2. Klik **Run**.
3. Izinkan akses spreadsheet jika diminta.
4. Cek log: harusnya `Bank_Soal`, `Daftar_Latihan`, `Hasil_Latihan` dibuat.

## 3. Impor 126 soal IPAS ke Bank_Soal

**Cara A — CSV (paling mudah)**

1. Buka file `bank-soal/Bank_Soal_IPAS_import.csv` (ada di folder artifacts proyek / generate ulang dari JSON).
2. Di spreadsheet, buka sheet `Bank_Soal`.
3. File → Import → Upload CSV → **Append to current sheet** (atau ganti sheet jika masih kosong selain header).
4. Pastikan baris 1 tetap header (jangan dobel header).

**Cara B — Staging + skrip**

1. Buat sheet `Import_Bank_Staging`.
2. Tempel isi CSV (termasuk header) ke sheet itu.
3. Run fungsi `importBankSoalDariStaging_`.
4. Hapus sheet staging setelah sukses.

## 4. Buat sesi latihan contoh

1. Buka `bank-soal/Daftar_Latihan_contoh.csv`.
2. Salin baris data ke sheet `Daftar_Latihan` (atau sesuaikan token/nama).
3. Token contoh: `LATIHAN1`.

## 5. Uji endpoint (setelah deploy)

Ganti `WEBAPP_URL` dengan URL Web App kamu:

```
GET  WEBAPP_URL?action=daftarLatihan
GET  WEBAPP_URL?action=soalLatihan&idLatihan=LAT-IPAS-BUNYI-01
GET  WEBAPP_URL?action=riwayatLatihan&mapel=IPAS
```

POST (body JSON):

```json
{ "action": "mulaiLatihan", "idLatihan": "LAT-IPAS-BUNYI-01", "token": "LATIHAN1", "nama": "Nama Siswa" }
```

```json
{
  "action": "submitLatihan",
  "idLatihan": "LAT-IPAS-BUNYI-01",
  "token": "LATIHAN1",
  "nama": "Nama Siswa",
  "hasil": { "skor": 8, "skorMaksimal": 10, "persentase": "80%" }
}
```

## Endpoint baru

| Method | action | Keterangan |
|--------|--------|------------|
| GET | `daftarLatihan` | Sesi aktif |
| GET | `soalLatihan` | Soal by idLatihan (dengan kunci untuk penilaian) |
| GET | `riwayatLatihan` | Filter: nama, mapel, materi, idLatihan |
| POST | `mulaiLatihan` | Validasi token + boleh ulang |
| POST | `submitLatihan` | Simpan + email ortu (jika aktif) |

## Fungsi manual (Run di editor)

| Fungsi | Kegunaan |
|--------|----------|
| `setupSheetLatihan_` | Buat 3 sheet + header |
| `importBankSoalDariStaging_` | Impor dari sheet staging |
| `tesKirimEmail` | Tes MailApp (sudah ada) |
