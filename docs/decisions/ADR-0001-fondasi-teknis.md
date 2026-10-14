# ADR-0001 — Fondasi teknis pedaree-web

Status: Diterima | Tanggal: 2026-10-14

## Konteks

`pedaree-web` lahir dari template Next.js 15 yang menyimpang dari standar divisi (Bun + Svelte 5 + SvelteKit 2). Sumber kebenaran: Pedaree-TownHall `platform/versions/v1.0.0` (https://github.com/Coding-Skuy/Pedaree-TownHall/tree/main/platform/versions/v1.0.0), beku 2026-10-07; lintas divisi: [KONTEKS-LINTAS-DIVISI.md](https://github.com/Coding-Skuy/ChefGenie-TownHall/blob/main/KONTEKS-LINTAS-DIVISI.md). Tiket fondasi: PDR-WEB-001 (issue #1).

## Keputusan

1. Stack web: Bun + Svelte 5 + SvelteKit 2 + TypeScript; Next.js/React dilarang untuk kode baru.
2. Repo drift ke Next.js 15.2.4 / React 19 dicatat; migrasi wajib dilakukan (tiket PDR-WEB-002) setelah kontrak API dibekukan.
3. Auth web memakai cookie sesi `httpOnly`; SSR memanggil API dengan service key server-ke-server; JWT audiens `pedaree`.
4. Tipe TypeScript digenerate dari skema JSON server agar nama field tidak menyimpang dari kontrak mobile.
5. Web tidak menghitung stok, FEFO, maupun sinyal TitipO; semua angka resmi datang dari server.

## Konsekuensi

- Selama migrasi berjalan, CI dan `pedaree-infra-devops` harus ikut diselaraskan (Node -> Bun).
- Kontrak API dibekukan selama migrasi; perubahan kontrak ditunda.
- `pedaree-design` harus menyediakan token yang dapat dipakai Svelte (bukan komponen React).
