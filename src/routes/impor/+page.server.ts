import { fail, redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import { praperiksaCsv } from "$lib/csv";
import { cacheDapur } from "$lib/server/cache";
import { klienUntuk } from "$lib/server/sesi";
import type { Actions } from "./$types";

export const actions: Actions = {
  impor: async ({ request, locals, url }) => {
    const sesi = locals.sesi!;
    const berkas = (await request.formData()).get("berkas");
    if (!(berkas instanceof File) || berkas.size === 0) return fail(400, { pesan: "Pilih berkas CSV terlebih dulu" });
    const periksa = praperiksaCsv(await berkas.text(), berkas.size);
    if (!periksa.ok) return fail(400, { pesan: periksa.pesan });
    try {
      const hasil = await klienUntuk(sesi).imporCsv(berkas, berkas.name);
      cacheDapur.batalkan(`${sesi.householdId}|`);
      return { hasil };
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.tidakSah) redirect(303, `/masuk?lanjut=${encodeURIComponent(url.pathname)}`);
        return fail(e.status >= 500 ? 502 : 422, { pesan: `${e.kode}: ${e.message}` });
      }
      return fail(502, { pesan: "Server API tidak terjangkau" });
    }
  },
};
