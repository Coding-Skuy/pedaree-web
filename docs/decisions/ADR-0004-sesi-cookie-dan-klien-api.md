# ADR-0004 — Sesi cookie httpOnly, klien API bertipe, dan cache SSR 60 detik

Status: Diterima | Tanggal: 2026-10-21

## Konteks

Tiket PDR-WEB-003 (issue #3). Kontrak diturunkan dari `docs/api/openapi.yaml` branch `feat/pdr-be-004-endpoint-stok` di `pedaree-backend-service` (PR #9, belum merge); salinannya ada di `docs/api/pedaree-backend-openapi.yaml`. Dokumen `produk/21` masih menyebut JWT 30 hari dan server Elysia; keputusan terkunci adalah JWT akses 15 menit + refresh 7 hari (reuse-detection), audiens `pedaree`.

## Keputusan

1. **Tipe tergenerate**: `bun run gen:api` (openapi-typescript 7.9.1) menghasilkan `src/lib/api/schema.d.ts` dari salinan spesifikasi. `src/lib/api/tipe.ts` hanya alias; nama field mengikuti server. Saat PR backend #9 merge, salin ulang spesifikasi dari `main` backend dan jalankan ulang.
2. **Sesi**: dua cookie `httpOnly`, `SameSite=Lax`, `Secure` (kecuali `PEDAREE_COOKIE_AMAN=false` untuk dev lokal): `pedaree_sess` (JWT akses, 15 menit) dan `pedaree_refresh` (7 hari). `householdId` dibaca dari klaim `hh` JWT (tanpa verifikasi tanda tangan di web; server API yang memverifikasi).
3. **Refresh di hook server**: token akses yang tinggal <30 detik ditukar lewat `/auth/refresh`. Refresh sekali pakai, jadi panggilan paralel berbagi satu promise per token (menghindari reuse-detection yang mencabut seluruh sesi). Gagal = hapus cookie, arahkan ke `/masuk?lanjut=...`.
4. **Panggilan API dari server** memakai `fetch` global, bukan `event.fetch` SvelteKit, agar cookie refresh tidak ikut diteruskan ke host API. Header: `X-Household-Id`, `X-Request-Id` (UUID baru per permintaan), `Authorization: Bearer`, dan `Cookie: pedaree_sess=...` (untuk `/web/*` yang berskema `cookieAuth`).
5. **Cache 60 detik**: adapter Bun tidak punya ISR; `/dapur` dan `/dapur/[id]` memakai cache memori TTL 60 detik per rumah tangga + kueri, plus `Cache-Control: private, max-age=60`; dibatalkan setelah mutasi. Mutasi dan semua `fetch` ke API memakai `cache: "no-store"`.
6. **401**: di SSR = redirect 303 ke `/masuk`; di fetch klien (`fetchKlien`) = dialog "Sesi berakhir" berisi tautan masuk ulang.
7. **Tanpa pendaftaran**: akun dan rumah tangga dibuat operator/admin (keputusan manusia untuk v1.0.0); web hanya punya login.

## Asumsi (belum terkonfirmasi backend)

- Respons `/auth/login` tidak memuat `householdId`; klaim `hh` pada JWT diasumsikan selalu ada.
- Server `/web/*` menerima `Authorization: Bearer` ataupun cookie `pedaree_sess` berisi JWT akses yang sama (kontrak hanya menyebut `cookieAuth`).
- Backend belum mengimplementasikan `/web/*` dan `/demand/*` (per laporan siklus 1 backend).
- Cache memori per proses; untuk banyak replika, cache tidak dibagi (aman karena hanya mempercepat).

## Konsekuensi

- Ketergantungan baru: `openapi-typescript` (dev).
- Env baru: `PEDAREE_API_URL`, `PEDAREE_COOKIE_AMAN` (lihat `.env.example`).
