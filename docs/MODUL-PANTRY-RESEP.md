# Modul pantry-resep — Kontrak Pawonee (pemilik) dan Pedaree (konsumen)

TownHall Pedaree: https://github.com/Coding-Skuy/Pedaree-TownHall

## Kedudukan

- **Pemilik:** Pawonee. Menetapkan skema resep, takaran, langkah, dan `recipe_id`.
- **Konsumen:** Pedaree. Web menampilkan resep dan status ketersediaan bahan.

## Aturan konsumen (berlaku untuk web)

1. Web Pedaree tidak menyimpan salinan resep; selalu merujuk `recipe_id`.
2. Penanda "tersedia" atau "kurang" dihitung dari API stok backend Pedaree.
3. Tautan "lihat resep lengkap" mengarah ke permukaan Pawonee.
4. Tembolok tampilan berumur paling lama 15 menit.
