# ADR-0002 — Tata kelola branch dan alur PR pedaree-web

Status: Diterima | Tanggal: 2026-10-21

## Konteks

Repo dikerjakan oleh banyak kontributor dan agent AI. Tanpa aturan, `main` rawan perubahan tanpa tinjauan. Tiket: PDR-WEB-GOV-BRANCH (issue #6). ADR-0001 belum mengatur alur kontribusi.

## Keputusan

1. Alur kontribusi: fork → branch dari `upstream/main` → atomic commit → PR ke `main` (rinci di `CONTRIBUTING.md`).
2. Penamaan branch `<jenis>/<kode-tiket-huruf-kecil>-<slug>`; satu branch = satu tiket = satu PR; PR memakai `Closes #N`.
3. Commit memakai Conventional Commits berbahasa Indonesia, atomic.
4. `.github/CODEOWNERS` menunjuk `@Coding-Skuy` sebagai pemilik seluruh repo sampai ada tim yang lebih spesifik.
5. **Usulan** proteksi branch `main` (belum diterapkan; penerapan oleh admin org):
   - wajib PR + minimal 1 persetujuan CODEOWNERS;
   - status check CI wajib hijau sebelum merge;
   - tanpa force-push dan tanpa penghapusan branch `main`;
   - riwayat linear (squash atau rebase merge).

## Konsekuensi

- Kontributor eksternal bekerja lewat fork; tidak ada push langsung ke repo org.
- Proteksi di poin 5 baru berlaku setelah admin menerapkannya di pengaturan repo; sampai itu, aturan bersifat konvensi.
