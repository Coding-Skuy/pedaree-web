import { fail, redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import { SATUAN, type Satuan } from "$lib/api/tipe";
import { tanggalWib } from "$lib/csv";
import { cacheDapur } from "$lib/server/cache";
import { klienUntuk } from "$lib/server/sesi";
import type { Actions, PageServerLoad } from "./$types";

const keMasuk = (url: URL) => redirect(303, `/masuk?lanjut=${encodeURIComponent(url.pathname)}`);

export const load: PageServerLoad = async ({ locals, url }) => {
  try {
    return { parcels: (await klienUntuk(locals.sesi!).daftarParcelTitipo()).data };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.tidakSah) keMasuk(url);
      if (e.status === 404) return { parcels: [], galat: "Endpoint /web/titipo/parcels belum tersedia di backend." };
      return { parcels: [], galat: `Parcel gagal dimuat (${e.kode}).` };
    }
    return { parcels: [], galat: "Server API tidak terjangkau." };
  }
};

export const actions: Actions = {
  /** Satu klik: buat draf Catat Masuk dari parcel. Draf belum mengubah stok. */
  draf: async ({ request, locals, url }) => {
    const id = String((await request.formData()).get("parcelId") ?? "");
    if (!id) return fail(400, { pesan: "parcelId wajib" });
    try {
      const { draf } = await klienUntuk(locals.sesi!).draftMasukDariParcel(id);
      return { parcelId: id, draf };
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.tidakSah) keMasuk(url);
        return fail(e.status === 409 ? 409 : e.status === 404 ? 404 : 502, { pesan: `${e.kode}: ${e.message}` });
      }
      return fail(502, { pesan: "Server API tidak terjangkau" });
    }
  },

  /** Simpan draf (boleh sudah dikoreksi pengguna) sebagai batch `MASUK_TITIPO` lewat `POST /pantry/batches`. */
  simpan: async ({ request, locals, url }) => {
    const sesi = locals.sesi!;
    const f = await request.formData();
    const ids = f.getAll("pantryItemId").map(String);
    const jumlah = f.getAll("jumlah").map((v) => Number(v));
    const satuan = f.getAll("satuan").map(String);
    if (ids.length === 0 || ids.length !== jumlah.length || ids.length !== satuan.length) return fail(400, { pesan: "Draf kosong atau rusak" });
    if (jumlah.some((j) => !(j > 0)) || satuan.some((s) => !SATUAN.includes(s as Satuan))) return fail(400, { pesan: "Jumlah harus > 0 dan satuan baku" });

    const klien = klienUntuk(sesi);
    const tanggalMasuk = tanggalWib(new Date());
    const tersimpan: string[] = [];
    try {
      for (let i = 0; i < ids.length; i++) {
        const item = await klien.detailItem(ids[i]); // lokasi default dari kartu bahan; server tetap memvalidasi
        const batch = await klien.catatMasuk({
          pantryItemId: ids[i],
          jumlah: jumlah[i],
          satuan: satuan[i] as Satuan,
          tanggalMasuk,
          lokasi: item.lokasiDefault,
          sumber: "MASUK_TITIPO",
        });
        tersimpan.push(batch.id);
      }
    } catch (e) {
      cacheDapur.batalkan(`${sesi.householdId}|`);
      if (e instanceof ApiError) {
        if (e.tidakSah) keMasuk(url);
        return fail(e.status === 422 || e.status === 409 ? 422 : 502, {
          pesan: `${e.kode}: ${e.message}`,
          tersimpan,
        });
      }
      return fail(502, { pesan: "Server API tidak terjangkau", tersimpan });
    }
    cacheDapur.batalkan(`${sesi.householdId}|`);
    return { tersimpan };
  },
};
