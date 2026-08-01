# Kuis Digital — SD Muhammadiyah 01 Kukusan

Website kuis/evaluasi singkat untuk siswa **kelas 5** SD Muhammadiyah 01 Kukusan (SDM01KKS). Digunakan guru untuk menguji pemahaman materi secara berkala — bisa dadakan atau terjadwal — langsung dari HP siswa.

## Tujuan

- Alat evaluasi cepat, bukan pengganti ujian resmi.
- Dipakai lintas mata pelajaran, dari kelas biasa sampai sesi latihan tambahan.
- Ringan di HP lama dengan memori terbatas, tetap nyaman dipakai di PC/laptop.

## Mata pelajaran

| Mata pelajaran | Status |
|---|---|
| Pendidikan Pancasila | 🔜 Segera hadir |
| Bahasa Indonesia | 🔜 Segera hadir |
| Matematika | 🔜 Segera hadir |
| IPAS | 🔜 Segera hadir |
| Seni Budaya (Seni Rupa & Seni Musik) | 🔜 Segera hadir |

Status akan diperbarui di `index.html` setiap kali sebuah kuis mapel resmi dirilis (badge `soon` → `ready`, kartu berubah jadi tautan aktif).

## Struktur file

```
kuis/
├── index.html        # Halaman utama (daftar mata pelajaran)
├── readme.md          # Dokumen ini
├── progress.md         # Catatan progres pengerjaan per fase
└── antiregresi.md       # Daftar cek agar perubahan baru tidak merusak fitur lama
```

Halaman kuis per mata pelajaran akan ditambahkan pada fase berikutnya, masing-masing sebagai folder/file terpisah agar mudah dipelihara satu per satu.

## Prinsip desain

- **Mobile-first**, tetap enak dipakai di layar besar (grid 2 kolom otomatis di atas 640px).
- **Warna minim**: 1 warna brand (hijau tua) + aksen kuning keemasan untuk penekanan; tiap mata pelajaran hanya dibedakan lewat warna ikon kecil, bukan warna latar kartu.
- **Font sistem** (tanpa unduh font eksternal) supaya halaman cepat dibuka di HP dengan koneksi/memori terbatas.
- **Kontrol ukuran tulisan** (tombol A− / A+) di header, tersimpan otomatis lewat `localStorage` sehingga preferensi siswa tetap terpakai di kunjungan berikutnya.
- Tanpa framework, tanpa build step — satu file HTML mandiri, gampang dibuka langsung atau di-hosting statis (GitHub Pages, dsb).

## Cara menjalankan

Cukup buka `index.html` langsung di browser, atau aktifkan GitHub Pages dari branch ini agar bisa diakses lewat tautan.

## Kontribusi lanjutan

Saat menambah kuis mata pelajaran baru:
1. Buat halaman/folder kuis mapel tersebut mengikuti pola soal yang sudah dipakai di proyek `cerdas-cermat`.
2. Ubah status mapel terkait di `index.html` dari `soon` menjadi `ready`, dan tambahkan atribut `href` menuju halaman kuisnya.
3. Catat perubahan di `progress.md`.
4. Cek ulang daftar di `antiregresi.md` sebelum publish.
