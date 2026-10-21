import { error, redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import type { PantryItemDetail } from "$lib/api/tipe";
import { cacheDapur } from "$lib/server/cache";
import { klienUntuk } from "$lib/server/sesi";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params, url, setHeaders }) => {
  const sesi = locals.sesi!;
  setHeaders({ "cache-control": "private, max-age=60" });
  try {
    const item = (await cacheDapur.ambil(`${sesi.householdId}|item|${params.id}`, () =>
      klienUntuk(sesi).detailItem(params.id),
    )) as PantryItemDetail;
    return { item };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.tidakSah) redirect(303, `/masuk?lanjut=${encodeURIComponent(url.pathname)}`);
      if (e.status === 404) error(404, "Bahan tidak ditemukan");
    }
    throw e;
  }
};
