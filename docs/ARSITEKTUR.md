# Arsitektur pedaree-web

TownHall: https://github.com/Coding-Skuy/Pedaree-TownHall

## Lapisan

1. Rute `src/app/`: `/stok`, `/mutasi`, `/resep-hemat`.
2. Komponen `src/components/`: tabel stok, garis waktu mutasi, kartu resep.
3. Pustaka `src/lib/`: klien `fetch` ke backend Pedaree dan API resep Pawonee.

## Alur utama

Peramban meminta `/stok` -> server Next.js mengambil `GET /v1/stok` dari
backend -> halaman merender tabel beserta lencana kedaluwarsa. Halaman
`/resep-hemat` menggabungkan stok dengan resep Pawonee.

## Keputusan

- App Router Next.js 15.2.4 dengan perenderan sisi server untuk tabel stok.
- Status kedaluwarsa dihitung di server agar konsisten dengan seluler.
