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

## Teknologi (versi dikunci)

- Node.js 22.14.0
- Next.js 15.2.4
- React 19.0.0
- TypeScript 5.7.3
- Tailwind CSS 4.0.0

Lihat `package.json` sebagai sumber kebenaran versi.

## Struktur

```text
src/app/           rute Next.js App Router
src/components/    komponen UI pantry
src/lib/           klien API backend dan util stok
docs/              arsitektur dan kontrak modul
```

## Cara jalan

```bash
npm ci
npm run dev
npm run build
```

Buka `http://localhost:3000` setelah `dev` berjalan.

## CI

Workflow `.github/workflows/ci.yml` menjalankan lint, uji, dan build produksi.
