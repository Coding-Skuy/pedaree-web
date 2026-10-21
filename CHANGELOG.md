# Changelog — pedaree-web

Format mengikuti Keep a Changelog; versi mengikuti TownHall.

## [Belum dirilis]

### Ditambahkan
- Fondasi AI-dev v1.0.0: `AGENTS.md`, `CLAUDE.md`, ADR-0001, `docs/ARSITEKTUR-AI-DEV.md` (2026-10-14).

### Diubah (PDR-WEB-002)
- Migrasi Next.js/React ke Bun + Svelte 5 + SvelteKit 2 (adapter Bun), CI Bun, ADR-0003 (2026-10-21).

### Ditambahkan (PDR-WEB-003)
- Tipe API tergenerate dari openapi backend (PR backend #9), klien `buatKlien`, sesi cookie `pedaree_sess`/`pedaree_refresh` httpOnly dengan refresh otomatis, halaman `/masuk`, `/dapur`, `/dapur/[id]`, cache SSR 60 detik, dialog masuk ulang untuk 401 di fetch klien, ADR-0004 (2026-10-21).

### Ditambahkan (PDR-WEB-004)
- Halaman `/dasbor` dengan enam angka dari `GET /web/dashboard`; grafik stockoutRate 90 hari, waste per kategori, dan top-10 item habis menunggu kontrak backend (2026-10-21).

### Ditambahkan (PDR-WEB-005)
- `/impor` (impor CSV maks 200 baris dan 512 KB, galat per baris dari server), ekspor `pedaree-stok-YYYYMMDD.csv` dan mutasi `dari`..`sampai`, `/titipo` (parcel DITERIMA menjadi draf Catat Masuk satu klik, lalu simpan sebagai batch `MASUK_TITIPO`) (2026-10-21).
