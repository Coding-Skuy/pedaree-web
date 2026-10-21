import { fail, redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import { lanjutAman } from "$lib/sesi";
import { klienUntuk, simpanSesi } from "$lib/server/sesi";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals, url }) => {
  if (locals.sesi) redirect(303, lanjutAman(url.searchParams.get("lanjut")));
  return { lanjut: lanjutAman(url.searchParams.get("lanjut")) };
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const f = await request.formData();
    const idPengguna = String(f.get("idPengguna") ?? "").trim();
    const kataSandi = String(f.get("kataSandi") ?? "");
    const lanjut = lanjutAman(String(f.get("lanjut") ?? ""));
    if (!idPengguna || !kataSandi) return fail(400, { pesan: "ID pengguna dan kata sandi wajib diisi", idPengguna });
    try {
      const token = await klienUntuk(null).login({ idPengguna, kataSandi });
      if (!simpanSesi(cookies, token)) return fail(502, { pesan: "Token dari server tidak memuat rumah tangga (klaim hh)", idPengguna });
    } catch (e) {
      if (e instanceof ApiError) {
        return fail(e.status === 401 ? 401 : 502, {
          pesan: e.status === 401 ? "ID pengguna atau kata sandi salah" : "Server tidak dapat memproses masuk",
          idPengguna,
        });
      }
      return fail(502, { pesan: "Server tidak terjangkau", idPengguna });
    }
    redirect(303, lanjut);
  },
};
