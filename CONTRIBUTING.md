# Panduan Kontribusi — pedaree-web

Repo ini memakai alur **fork → branch → atomic commit → PR**. Tinjauan manusia wajib; tidak ada push langsung ke `main`.

## Alur

1. **Fork** repo ke akun sendiri: `gh repo fork Coding-Skuy/pedaree-web --clone`, lalu tambah remote `upstream` ke repo org.
2. **Branch** dari `upstream/main` yang terbaru. Satu branch = satu tiket = satu PR.
   Format: `<jenis>/<kode-tiket-huruf-kecil>-<slug>`, contoh `feat/pdr-web-004-dasbor`, `test/pdr-web-test-pact-konsumen`,
   `docs/pdr-web-gov-branch-alur-kontribusi`, `chore/...`. Kode tiket: `PDR-WEB-NNN`.
3. **Atomic commit**: satu perubahan logis per commit, Conventional Commits berbahasa Indonesia
   (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`). Commit yang mengubah perilaku wajib memperbarui `CHANGELOG.md`.
4. **Uji lokal** sebelum PR (kode baru wajib disertai uji; TDD merah-hijau bila praktis). Rilis diblokir bila QA gate (SRS QA-001..QA-003) gagal.
5. **Push** ke fork lalu buka **PR** ke `Coding-Skuy/pedaree-web` base `main`, isi templat PR, cantumkan `Closes #N`.
6. Jangan merge sendiri; jangan force-push ke `main`; PR menunggu tinjauan CODEOWNERS.

## Aturan penting

- Stack terkunci: Bun + Svelte 5 + SvelteKit 2 + TypeScript. Dilarang Next.js/React untuk kode baru.
- Dokumen `versions/v*/` beku (immutable); keputusan baru = ADR baru di `docs/decisions/`.
- Requirement berubah = PR di `Pedaree-TownHall` dahulu. Jangan menduplikasi requirement di repo ini.
- Tipe API diturunkan dari `docs/api/openapi.yaml` backend; web tidak menghitung stok/FEFO/sinyal sendiri.
- Jangan commit rahasia (`.env`, kunci, token). Jangan simpan token di `localStorage`.

Lihat juga `AGENTS.md`, `docs/decisions/` (ADR-0002 memuat usulan proteksi branch `main`).
