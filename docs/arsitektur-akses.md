# Arsitektur akses Siswa / Guru

## Keputusan struktur (2026-09-29)

**Tidak** memindahkan folder mapel (`ipas/`, `bahasa-indonesia/`, dll.) ke `pages/`.
Alasan: URL kuis yang sudah dibagikan ke siswa akan putus; risiko regresi tinggi.

## Alur baru

```
index.html          → pintu masuk (pilih Siswa / Guru)
beranda.html        → beranda siswa (ex-index: daftar mapel, latihan, riwayat)
guru/index.html     → dashboard guru (setelah sandi)
guru/setup.html     → setup sheet latihan
latihan/            → halaman siswa kerjakan latihan
ipas/ dll.          → kuis mapel (tidak diubah)
```

## Sandi guru

Di Code.gs: `const GURU_TOKEN = 'guru-sdm01-2026';`
Ganti setelah deploy. Dipakai untuk `loginGuru` dan `setupLatihan`.

## Endpoint baru

| action | Method | Keterangan |
|--------|--------|------------|
| loginGuru | POST | body: { sandi } |
| setupLatihan | POST | body: { tokenSetup atau sandi } |
