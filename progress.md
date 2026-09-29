# Progress — Kuis Digital SDM01KKS

Catatan progres pengerjaan, disusun per fase supaya mudah dilanjutkan di sesi berikutnya.

## Status ringkas

| Fase | Deskripsi | Status |
|---|---|---|
| 1 | Halaman utama (`index.html`) + dokumen proyek | ✅ Selesai (2 Agu 2026) |
| L1 | **Latihan ATS/AAS — Bank soal IPAS** | 🟡 Berjalan (29 Sep 2026) |
| 2 | Kuis Pendidikan Pancasila | ⬜ Belum mulai |
| 3 | Kuis Bahasa Indonesia | ⬜ Belum mulai |
| 4 | Kuis Matematika | ⬜ Belum mulai |
| 5 | Kuis IPAS (harian) | ✅ Ada 2 kuis |
| 6 | Kuis Seni Budaya | ⬜ Belum mulai |

---

## Fase Latihan-1 — Bank soal IPAS untuk ATS/AAS (Berjalan)

**Tanggal:** 29 September 2026

**Tujuan fitur latihan (rencana lengkap):**
- Pool soal → guru merancang kuis (mapel, materi, kompleksitas)
- Hanya PG & PGK; mapel: Bahasa Indonesia, IPAS, Pendidikan Pancasila
- Hasil ke ortu; riwayat per siswa/kelas; grafik perkembangan; cetak PDF

**Yang dikerjakan hari ini:**
- Dibersihkan pool sumber 300 soal → **126 soal unik** PG/PGK (buang 119 duplikat + 2 rusak)
- 4 materi besar: Gelombang Bunyi (55), Gelombang Cahaya (29), Ekosistem (29), Bencana Alam & Perubahan Lingkungan (13)
- Kompleksitas **L1 / L2 / L3** (bukan C1–C5)
- Schema `1.0-latihan`; folder `bank-soal/` di repo
- File indeks: `bank-soal/ipas-ganjil-2026.json`
- Bagian Lingkungan sudah di-commit: `bank-soal/ipas/lingkungan.json` (13 soal)
- File penuh 126 soal: workspace `artifacts/bank-soal/ipas-ganjil-2026.json`

**Belum dikerjakan / langkah berikutnya:**
- Commit sisa bagian soal (Bunyi, Cahaya, Ekosistem) ke `bank-soal/ipas/`
- Desain sheet Spreadsheet `Bank_Soal` + endpoint backend
- Kerangka pool Bahasa Indonesia & Pendidikan Pancasila
- Halaman siswa + panel guru + riwayat + grafik + PDF

---

## Fase 1 — Halaman utama (Selesai)

**Tanggal:** 2 Agustus 2026

Lihat riwayat sebelumnya di commit historis untuk detail fase 1–6 (kuis harian, riwayat live, cekStatusKuis).
