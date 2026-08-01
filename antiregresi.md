# Anti-Regresi — Kuis Digital SDM01KKS

Daftar cek manual sebelum publish perubahan apa pun ke `index.html` atau halaman kuis mapel. Tujuannya: perubahan baru tidak diam-diam merusak fitur yang sudah jalan.

Cara pakai: centang tiap poin sebelum commit/publish. Kalau ada satu poin gagal, perbaiki dulu sebelum lanjut.

## 1. Tampilan dasar

- [ ] Halaman terbuka tanpa error di console (buka DevTools → tab Console, harus kosong dari error merah).
- [ ] Tidak ada elemen yang terpotong atau tumpang tindih di lebar layar 360px (HP kecil/lama).
- [ ] Tidak ada elemen yang terlihat aneh/melebar di lebar layar ≥1280px (PC/laptop).
- [ ] Jarak antar kartu mata pelajaran konsisten (garis putus-putus antar kartu tidak hilang/dobel).
- [ ] Warna latar, warna teks, dan kontras tidak berubah tanpa disengaja (badge "Segera hadir" vs badge aktif harus tetap beda gaya).

## 2. Kontrol ukuran tulisan (A− / A+)

- [ ] Tombol A+ memperbesar tulisan di seluruh halaman, bukan cuma sebagian.
- [ ] Tombol A− memperkecil tulisan, dan berhenti di batas minimum (tidak sampai tulisan jadi tidak terbaca).
- [ ] Ukuran tulisan tidak bisa diperbesar sampai merusak tata letak (kartu tetap rapi walau di ukuran maksimum).
- [ ] Setelah reload halaman, ukuran tulisan yang dipilih sebelumnya tetap tersimpan (cek lewat `localStorage`).

## 3. Responsif (mobile ↔ PC)

- [ ] Layout 1 kolom di HP (lebar < 640px).
- [ ] Layout otomatis jadi 2 kolom di lebar ≥ 640px, tanpa kartu yang terpotong.
- [ ] Header (nama sekolah + tombol ukuran tulisan) tidak tumpang tindih di layar sempit.
- [ ] Teks judul (`Yuk, latihan kuis harian!`) tidak overflow ke luar layar di HP kecil.

## 4. Status & tautan mata pelajaran

- [ ] Setiap mapel yang **belum** ada kuisnya tetap berstatus "Segera hadir" dan kartunya tidak bisa diklik.
- [ ] Setiap mapel yang **sudah** diaktifkan (status `ready`) mengarah ke halaman kuis yang benar (bukan link mati / 404).
- [ ] Ikon tiap mapel tetap sesuai mapelnya setelah ada perubahan kode (Pancasila, Bahasa Indonesia, Matematika, IPAS, Seni Budaya tidak tertukar).
- [ ] Urutan mapel di halaman tidak berubah tanpa alasan (kecuali memang diminta).

## 5. Performa & kompatibilitas HP lama

- [ ] Tidak ada font atau gambar baru yang diunduh dari internet (tetap pakai system font + SVG inline) — cek tab Network di DevTools.
- [ ] Ukuran total file `index.html` tidak melonjak drastis dibanding versi sebelumnya.
- [ ] Halaman tetap terasa responsif (tidak lag) saat dibuka di mode simulasi jaringan lambat (DevTools → Network → Slow 3G).
- [ ] Tidak ada JavaScript tambahan yang berjalan otomatis dan berat (animasi terus-menerus, polling, dsb.).

## 6. Aksesibilitas dasar

- [ ] Semua tombol bisa dijangkau pakai keyboard (Tab) dan terlihat jelas saat fokus (outline muncul).
- [ ] Teks alternatif/label ARIA pada tombol A− / A+ dan ikon mapel tidak hilang.
- [ ] Kontras teks-terhadap-latar masih nyaman dibaca (terutama teks abu-abu `subj-meta` dan `status`).

## 7. Sebelum publish ke banyak siswa

- [ ] Sudah dicoba di minimal 1 HP Android lama sungguhan (bukan cuma simulasi browser).
- [ ] Sudah dicoba di 1 browser desktop (Chrome/Edge) dan 1 browser HP (Chrome Android/Safari iOS bila ada).
- [ ] `progress.md` sudah diperbarui sesuai perubahan yang dipublish.
- [ ] Tidak ada data pribadi siswa (nama, kelas, nilai) yang ter-hardcode di file HTML.

