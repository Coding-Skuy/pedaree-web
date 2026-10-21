import { redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import { KATEGORI, STATUS_STOK, type HalamanItem, type Kategori, type StatusStok } from "$lib/api/tipe";
import { cacheDapur } from "$lib/server/cache";
import { klienUntuk } from "$lib/server/sesi";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
  const sesi = locals.sesi!;
  const q = url.searchParams.get("q") ?? undefined;
  const kat = url.searchParams.get("kategori");
  const st = url.searchParams.get("statusStok");
  const kategori = KATEGORI.includes(kat as Kategori) ? (kat as Kategori) : undefined;
  const statusStok = STATUS_STOK.includes(st as StatusStok) ? (st as StatusStok) : undefined;
  const cursor = url.searchParams.get("cursor") ?? undefined;

  setHeaders({ "cache-control": "private, max-age=60" });
  try {
    const halaman = (await cacheDapur.ambil(`${sesi.householdId}|daftar|${url.search}`, () =>
      klienUntuk(sesi).daftarItem({ q, kategori, statusStok, cursor, limit: 20 }),
    )) as HalamanItem;
    return { halaman, filter: { q: q ?? "", kategori: kategori ?? "", statusStok: statusStok ?? "" } };
  } catch (e) {
    if (e instanceof ApiError && e.tidakSah) redirect(303, `/masuk?lanjut=${encodeURIComponent(url.pathname + url.search)}`);
    throw e;
  }
};
