# pedaree-web — Dasbor Pantry Web

Divisi **Pedaree (Smart Pantry)**, org **Coding-Skuy**. Opsi A.

TownHall: https://github.com/Coding-Skuy/Pedaree-TownHall

## Ringkasan

Dasbor web untuk melihat stok pantry, riwayat mutasi, dan pengingat kedaluwarsa
dari peramban. Mendampingi aplikasi seluler `pedaree-app-kmp`.

## Modul pantry-resep

Kontrak lintas divisi (detail: `docs/MODUL-PANTRY-RESEP.md`):

- **Pemilik modul:** Pawonee.
- **Konsumen modul:** Pedaree (web hanya menampilkan resep dan menandai bahan
  yang tersedia atau kurang dari stok lokal).
- Perubahan definisi resep dilakukan di Pawonee; web Pedaree bersifat baca saja
  terhadap data resep.

## Teknologi (versi dikunci eksak)

- Bun 1.4.2
- Svelte 5.28.7 + SvelteKit 2.22.5 (adapter `svelte-adapter-bun`)
- TypeScript 5.9.2
- Vite 6.3.5, Vitest 3.2.4

Lihat `package.json` dan `bun.lock` sebagai sumber kebenaran versi. Next.js/React dilarang.

## Struktur

```text
src/routes/        rute SvelteKit (+page.svelte, +layout.svelte, +page.server.ts)
src/lib/           klien API backend dan util stok
docs/              arsitektur dan kontrak modul
```

## Cara jalan

```bash
bun install
bun run dev        # http://localhost:5173
bun run check
bun run test
bun run build
```

## CI

Workflow `.github/workflows/ci.yml` menjalankan `bun run check`, uji, dan build produksi dengan Bun.
