# Desain Spreadsheet — Fitur Latihan ATS/AAS

Spreadsheet: **Database_Kuis** (ID: `1jT4Lbqkg7YfnGcS7OH5mHBWrJ7k4V23Vz5DobKrX1U0`)

## Prinsip

1. **Sheet lama tidak diubah** — `Nama_Siswa`, `Daftar_Kuis`, `Hasil_Kuis`, `Log_Email` tetap untuk kuis resmi.
2. **Latihan = boleh berulang** — hasil disimpan di sheet terpisah (`Hasil_Latihan`), bukan di `Hasil_Kuis`.
3. **Bank soal = sumber filter guru** — pilih mapel → materi → kompleksitas → susun sesi latihan.
4. **Email ortu** — pola sama dengan kuis (MailApp + log), opsional per sesi.

---

## Sheet yang dipakai ulang (tidak diubah)

| Sheet | Dipakai untuk latihan |
|-------|------------------------|
| `Nama_Siswa` | Login siswa + email ortu |
| `Log_Email` | Catat kirim email hasil latihan (isi ID dengan prefix `LAT-`) |

---

## Sheet baru (3 sheet)

### 1. `Bank_Soal`

Satu baris = satu soal. Sumber data utama (bisa diisi manual atau impor dari JSON repo).

| Kolom | Header | Tipe | Keterangan |
|------:|--------|------|------------|
| A | `ID_Soal` | teks | Unik, contoh: `IPAS-BUNYI-003` |
| B | `Mapel` | teks | `IPAS` / `Bahasa Indonesia` / `Pendidikan Pancasila` |
| C | `Materi` | teks | 4 kelompok besar IPAS: `Gelombang Bunyi`, `Gelombang Cahaya`, `Ekosistem`, `Bencana Alam & Perubahan Lingkungan` |
| D | `Sub_Materi` | teks | Opsional, detail lebih halus |
| E | `Tipe` | teks | `pg` atau `pgk` |
| F | `Kompleksitas` | teks | `L1` / `L2` / `L3` |
| G | `Pertanyaan` | teks panjang | Teks soal |
| H | `Opsi_JSON` | teks/JSON | `[{"id":"a","teks":"..."},{"id":"b","teks":"..."}]` |
| I | `Kunci_JSON` | teks/JSON | `["a"]` atau `["a","c"]` untuk PGK |
| J | `Pembahasan` | teks | Penjelasan kunci |
| K | `Skor` | angka | Default 1 (pg), 2 (pgk) |
| L | `Context_ID` | teks | Kosong atau id konteks (mis. `ctx_1`) |
| M | `Context_Judul` | teks | Judul bacaan (jika ada) |
| N | `Context_Teks` | teks panjang | Isi bacaan (jika ada) |
| O | `Status` | teks | `aktif` / `nonaktif` |
| P | `Tahun_Ajaran` | teks | `2026/2027` |
| Q | `Semester` | teks | `ganjil` / `genap` |

**Filter guru:** Mapel + Materi + Kompleksitas (+ Status=aktif).

---

### 2. `Daftar_Latihan`

Sesi latihan yang disusun guru (mirip `Daftar_Kuis`, tapi untuk latihan).

| Kolom | Header | Tipe | Keterangan |
|------:|--------|------|------------|
| A | `ID_Latihan` | teks | Unik, contoh: `LAT-IPAS-ATS-01` |
| B | `Nama_Latihan` | teks | Tampil di siswa, mis. `Latihan ATS IPAS — Bunyi & Cahaya` |
| C | `Mapel` | teks | Satu mapel per sesi |
| D | `Materi` | teks | Bisa gabungan, mis. `Gelombang Bunyi;Gelombang Cahaya` |
| E | `Kompleksitas` | teks | Filter, mis. `L1;L2` atau `semua` |
| F | `ID_Soal_List` | teks | Daftar ID soal dipisah `;` (hasil pilihan guru) |
| G | `Jumlah_Soal` | angka | Dihitung dari list |
| H | `Durasi_Menit` | angka | 0 = tanpa batas waktu |
| I | `Token` | teks | Token masuk (bisa sama pola dengan kuis) |
| J | `Boleh_Ulang` | teks | `ya` / `tidak` (default `ya`) |
| K | `Kirim_Email_Ortu` | teks | `ya` / `tidak` |
| L | `Status` | teks | `aktif` / `nonaktif` / `arsip` |
| M | `Dibuat` | tanggal | Timestamp pembuatan |
| N | `Catatan` | teks | Opsional untuk guru |

---

### 3. `Hasil_Latihan`

Setiap submit = satu baris. **Boleh banyak baris** untuk siswa + ID_Latihan yang sama (beda percobaan).

| Kolom | Header | Tipe | Keterangan |
|------:|--------|------|------------|
| A | `Timestamp` | datetime | Waktu submit |
| B | `ID_Latihan` | teks | FK ke Daftar_Latihan |
| C | `Nama_Latihan` | teks | Denormalisasi untuk laporan |
| D | `Nama_Siswa` | teks | |
| E | `Mapel` | teks | |
| F | `Materi` | teks | |
| G | `Percobaan_Ke` | angka | 1, 2, 3… dihitung saat simpan |
| H | `Skor` | angka | |
| I | `Skor_Maksimal` | angka | |
| J | `Persentase` | teks/angka | mis. `85` atau `85%` |
| K | `Detail_JSON` | teks/JSON | Opsional: jawaban per soal untuk analisis |
| L | `Status_Email_Ortu` | teks | `Terkirim` / `Gagal` / `Dilewati` / … |
| M | `Waktu_Kirim_Email` | datetime | |

**Grafik perkembangan:** filter `Nama_Siswa` + `Mapel`/`Materi`, plot `Timestamp` vs `Persentase` (semua percobaan).

---

## Alur singkat

```
Guru isi Bank_Soal (impor JSON / manual)
        ↓
Guru buat sesi di Daftar_Latihan (pilih soal by filter)
        ↓
Siswa login (Nama_Siswa) + token → kerjakan
        ↓
Submit → Hasil_Latihan (+ email ortu jika diaktifkan)
        ↓
Riwayat / grafik / PDF (filter mapel atau materi)
```

## Endpoint backend baru (rencana Code.gs)

| Method | action | Keterangan |
|--------|--------|------------|
| GET | `daftarLatihan` | Sesi latihan aktif (untuk menu siswa) |
| GET | `soalLatihan` | Ambil soal by `idLatihan` |
| GET | `riwayatLatihan` | Hasil latihan (per siswa / kelas, filter mapel/materi) |
| POST | `mulaiLatihan` | Validasi token + cek boleh ulang |
| POST | `submitLatihan` | Simpan Hasil_Latihan + email |

Catatan: pola penilaian tetap di sisi HTML dulu (sama seperti kuis), supaya konsisten.

## Impor Bank_Soal dari JSON

Dari file repo `bank-soal/ipas/*.json` (126 soal):

1. Gabungkan semua `soal[]`
2. Map field: `id`→`ID_Soal`, `mapel`→`Mapel`, `materi`→`Materi`, dst.
3. `Opsi_JSON` / `Kunci_JSON` = stringify array
4. `Status` = `aktif`, `Tahun_Ajaran` = `2026/2027`, `Semester` = `ganjil`

Bisa diimpor lewat Apps Script atau CSV.

---

## Yang TIDAK dilakukan di fase ini

- Mengubah kolom `Hasil_Kuis` / `Daftar_Kuis`
- Memaksa 1× kerja untuk latihan (default boleh ulang)
- PDF & grafik (fase setelah data mengalir)
