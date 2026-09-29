# Bank Soal — Latihan ATS/AAS

Pool soal untuk fitur **latihan** (persiapan asesmen tengah & akhir semester) kelas 5 SD Muhammadiyah 01 Kukusan.

## Mapel yang didukung

| Mapel | Status | File |
|-------|--------|------|
| Bahasa Indonesia | Belum | — |
| **IPAS** | ✅ Siap (126 soal) | `ipas-ganjil-2026.json` + `ipas/*.json` |
| Pendidikan Pancasila | Belum | — |

## Skema soal

- Tipe: **pg** (pilihan ganda) dan **pgk** (pilihan ganda kompleks)
- Kompleksitas: **L1** (dasar) · **L2** (menengah) · **L3** (lanjut / multi-jawaban)
- Filter guru: mapel → materi → kompleksitas

## IPAS — Semester Ganjil 2026/2027

| Materi | Kode | Soal | File di repo |
|--------|------|-----:|--------------|
| Gelombang Bunyi | BUNYI | 55 | `ipas/bunyi-1.json` + `ipas/bunyi-2.json` *(sedang diunggah)* |
| Gelombang Cahaya | CAHAYA | 29 | `ipas/cahaya.json` *(sedang diunggah)* |
| Ekosistem | EKOSISTEM | 29 | `ipas/ekosistem.json` *(sedang diunggah)* |
| Bencana Alam & Perubahan Lingkungan | LINGKUNGAN | 13 | `ipas/lingkungan.json` ✅ |
| **Total** | | **126** | |

`ipas-ganjil-2026.json` = **indeks** (metadata + daftar file). Soal lengkap ada di folder `ipas/`.

File penuh tunggal (126 soal) juga tersedia di workspace proyek: `artifacts/bank-soal/ipas-ganjil-2026.json`.

Sumber: pool latihan ATS ganjil, dibersihkan dari duplikat & opsi rusak (29 Sep 2026).
