# ADR-0003 — Migrasi pedaree-web ke Bun + Svelte 5 + SvelteKit 2

Status: Diterima | Tanggal: 2026-10-21

## Konteks

Pelaksanaan kewajiban ADR-0001 (butir 1-2), tiket PDR-WEB-002 (issue #2). Repo sebelumnya hanya berisi `src/lib/stok.ts` + uji dan konfigurasi Next.js 15.2.4 / React 19 (tidak ada rute `src/app` di repo).

## Keputusan

1. Versi dikunci eksak: Bun 1.4.2, Svelte 5.28.7, SvelteKit 2.22.5, TypeScript 5.9.2, Vite 6.3.5, `@sveltejs/vite-plugin-svelte` 5.1.0, `svelte-adapter-bun` 1.0.2, Vitest 3.2.4.
2. Penyimpangan dari rujukan tiket: Bun 1.4.4 tidak tersedia di mesin pengembang saat migrasi; dipakai 1.4.2 (terverifikasi). Naikkan ke 1.4.4 lewat PR terpisah bila diperlukan.
3. Uji tetap Vitest (`bun run test`); `bun test` bawaan tidak dipakai karena menjalankan runner Bun, bukan Vitest.
4. Tailwind belum dipasang; styling ditentukan ADR terpisah dengan token dari `pedaree-design`.
5. Adapter: `svelte-adapter-bun` 1.0.2 (berstatus deprecated oleh pemeliharanya). `@sveltejs/adapter-bun` 1.0.0 dicoba lebih dulu tetapi gagal dengan SvelteKit 2.22.5 (`builder.generateServerInstance is not a function`; butuh SvelteKit lebih baru). Ganti adapter saat versi SvelteKit dinaikkan lewat ADR baru. `vite.config.ts` memakai `vitest/config` dan `overrides.vite` mengunci satu salinan Vite 6.3.5.
6. `src/lib/stok.ts` dan `stok.test.ts` dipertahankan tanpa perubahan perilaku.

## Konsekuensi

- CI beralih dari Node/npm ke Bun. `pedaree-infra-devops` perlu diselaraskan.
- `package-lock.json` tidak ada; `bun.lock` menjadi kunci dependensi.
