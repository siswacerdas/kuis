# Bank Soal — Latihan ATS/AAS

Pool soal untuk fitur **latihan** (persiapan asesmen tengah & akhir semester) kelas 5 SD Muhammadiyah 01 Kukusan.

## Mapel yang didukung

| Mapel | Status | File |
|-------|--------|------|
| Bahasa Indonesia | Belum | — |
| **IPAS** | ✅ Lengkap (126 soal) | `ipas-ganjil-2026.json` + `ipas/*.json` |
| Pendidikan Pancasila | Belum | — |

## Skema soal

- Tipe: **pg** (pilihan ganda) dan **pgk** (pilihan ganda kompleks)
- Kompleksitas: **L1** (dasar) · **L2** (menengah) · **L3** (lanjut / multi-jawaban)
- Filter guru: mapel → materi → kompleksitas

## IPAS — Semester Ganjil 2026/2027 ✅

| Materi | Kode | Soal | File |
|--------|------|-----:|------|
| Gelombang Bunyi | BUNYI | 55 | `ipas/bunyi-1-*.json` + `ipas/bunyi-2-*.json` |
| Gelombang Cahaya | CAHAYA | 29 | `ipas/cahaya-1.json` … `cahaya-3.json` |
| Ekosistem | EKOSISTEM | 29 | `ipas/ekosistem-1.json` … `ekosistem-3.json` |
| Bencana Alam & Perubahan Lingkungan | LINGKUNGAN | 13 | `ipas/lingkungan.json` |
| **Total** | | **126** | |

`ipas-ganjil-2026.json` = **indeks** (metadata + daftar file). Gabungkan array `soal` dari semua file di folder `ipas/`.

Cadangan file penuh (126 soal) juga di workspace proyek: `artifacts/bank-soal/ipas-ganjil-2026.json`.

## Upload file besar

```bash
export GITHUB_TOKEN=ghp_xxxx   # PAT contents:write
./scripts/upload-github-file.sh siswacerdas/kuis path/di/repo file-lokal.json
```

Sumber: pool latihan ATS ganjil, dibersihkan dari duplikat & opsi rusak (29 Sep 2026).
