> Versi: v1.0.0 | Status: disetujui | Menggantikan: -

# ARSITEKTUR-AI-DEV — Stack terkunci dan batas context (pedaree-web)

Mengacu: Pedaree-TownHall `platform/versions/v1.0.0` (https://github.com/Coding-Skuy/Pedaree-TownHall/tree/main/platform/versions/v1.0.0), beku 2026-10-07. Dokumen ini MELENGKAPI `versions/v1.0.0/docs/40-TECHSTACK.md` dan `versions/v1.0.0/docs/60-BLAST-RADIUS.md` (keduanya beku v1.0.0 dan tidak diedit; isinya hanya ringkasan satu paragraf). Tidak menduplikasi BRD/PRD/FRD/FSD/SRS.

Baris Pedaree townhall-roadmap §2: point of concern "FEFO; stockout <8%; waste <1.500 g/Rp50.000/bln"; batas context "13 satuan baku; konsumen modul `pantry-resep` milik Pawonee". Rujukan lintas divisi: KONTEKS §3.1, §6, §8, §9.

## 1. Matriks stack

| Komponen | Kondisi saat ini (tercatat dari manifes/README) | Target terkunci v1.0.0 |
|---|---|---|
| Runtime | Node.js 22.14.0 | Bun (versi eksak dikunci saat kickoff) |
| Framework | Next.js 15.2.4 | SvelteKit 2 |
| UI | React 19.0.0 | Svelte 5 (runes) |
| Bahasa | TypeScript 5.7.3 | TypeScript 5.9.x (rujukan `produk/21`) |
| Styling | Tailwind CSS 4.0.0 | ditentukan di ADR baru saat migrasi (token dari `pedaree-design`) |
| Uji | vitest 2.1.8 | uji TDD di Bun (`bun test`/vitest) + uji kontrak |
| Tipe API | `src/lib/stok.ts` tulis tangan | digenerate dari skema JSON server |

## 2. Kewajiban migrasi (drift Next.js/React)

Repo masih Next.js 15.2.4 + React 19.0.0 — menyimpang dari standar divisi. Migrasi ke **Bun + Svelte 5 + SvelteKit 2** WAJIB dilakukan; tiket pelaksana `PDR-WEB-002` (issue #2).

Langkah: (1) bekukan kontrak API; (2) ganti `package.json` (keluarkan `next`, `react`, `react-dom`; masukkan `@sveltejs/kit`, `svelte`, `vite`, adapter Bun); (3) pindahkan `src/app/*` ke `src/routes/*` (`+page.svelte`, `+layout.svelte`, `+page.server.ts`); (4) pindahkan `src/lib/stok.ts` beserta `stok.test.ts`; (5) ganti `next.config` dengan `svelte.config.js` + `vite.config.ts`; (6) validasi `bun install`, `bun run check`, `bun run build`, uji kontrak; (7) perbarui CI di `pedaree-infra-devops`.

Syarat mulai: kontrak API dibekukan dan fase coding disetujui TownHall (D-003). Tidak ada fitur baru di kode Next.js.

## 3. Boleh disentuh repo ini

- `src/routes/` (halaman `/dapur`, `/dapur/[id]`, `/dasbor`, `/masuk`) dan `src/lib/`.
- Pemanggilan `https://api.pedaree.chefgenie.id/v1` (endpoint `/web/*` dan `/pantry/*`).
- Impor/ekspor CSV lewat API.

## 4. Dilarang

- Menghitung stok, FEFO, waste, atau sinyal di klien.
- Mengakses DB mana pun langsung.
- Menambah Next.js/React untuk kode baru.
- Menyentuh DB divisi lain (DB per service; Titeny hanya read-only ke DB sumber).
- Membuat pesanan TitipO otomatis dari sinyal stok (hanya anjuran, relevansi 48 jam).
- Mengubah modul `:shared:pantry-resep` (milik Pawonee), daftar 13 satuan, ambang kedaluwarsa, atau audiens JWT tanpa PR TownHall + ADR.

## 5. Kontrak yang diproduksi

- Halaman web pendamping (`/dapur`, `/dasbor`) dan ekspor CSV `pedaree-stok-YYYYMMDD.csv`.
- Tipe TS tergenerate dari skema server.

## 6. Kontrak yang dikonsumsi

- API backend Pedaree v1 (`/web/dashboard`, `/web/import/csv`, `/web/export/*`, `/web/titipo/parcels`).
- Token desain dari `pedaree-design`.

## 7. Dampak bila berubah

- Migrasi framework berdampak pada CI (`pedaree-infra-devops`) dan token desain.
- Perubahan skema JSON server memecahkan tipe tergenerate; regenerasi wajib.

## Batasan

- Dokumen ini hanya mencatat stack dan batas; tidak mengubah manifes atau kode. Kondisi saat ini dicatat apa adanya.
- Versi dikunci eksak di manifes saat kickoff coding; perubahan dicatat lewat ADR baru.
- JWT audiens `pedaree`, DB logis `pedaree`, dan kepemilikan Pawonee atas `:shared:pantry-resep` tidak berubah oleh dokumen ini.
