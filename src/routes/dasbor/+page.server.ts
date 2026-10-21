import { redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import { klienUntuk } from "$lib/server/sesi";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
  setHeaders({ "cache-control": "private, no-store" });
  try {
    return { dasbor: await klienUntuk(locals.sesi!).dasbor() };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.tidakSah) redirect(303, `/masuk?lanjut=${encodeURIComponent(url.pathname)}`);
      // Backend siklus 1 belum mengimplementasikan /web/*: tampilkan keadaan jujur, bukan angka karangan.
      if (e.status === 404) return { dasbor: null, galat: "Endpoint /web/dashboard belum tersedia di backend." };
      return { dasbor: null, galat: `Dasbor gagal dimuat (${e.kode}).` };
    }
    return { dasbor: null, galat: "Server API tidak terjangkau." };
  }
};
