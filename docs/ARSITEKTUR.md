# Arsitektur pedaree-web

TownHall: https://github.com/Coding-Skuy/Pedaree-TownHall

## Lapisan

1. Rute `src/routes/` (SvelteKit 2): halaman `+page.svelte`, tata letak `+layout.svelte`, muat data server `+page.server.ts`.
2. Komponen Svelte 5 (runes) di `src/lib/`.
3. Pustaka `src/lib/`: klien `fetch` ke backend Pedaree dan util tampilan stok.

## Alur utama

Peramban meminta halaman -> server SvelteKit (adapter Bun) memanggil API backend server-ke-server -> halaman dirender SSR.
Web tidak menghitung stok, FEFO, maupun sinyal TitipO; angka resmi berasal dari server (ADR-0001).

## Keputusan

- Bun + Svelte 5 + SvelteKit 2 + TypeScript (menggantikan Next.js/React; lihat ADR-0003).
- Rute produk (`/dapur`, `/dasbor`) dibangun pada tiket PDR-WEB-003/004.
