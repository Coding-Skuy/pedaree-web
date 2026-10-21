import { redirect, type Handle } from "@sveltejs/kit";
import { COOKIE_SESI } from "$lib/api/klien";
import { COOKIE_REFRESH, dekodeJwt, perluRefresh, terlindungi } from "$lib/sesi";
import { hapusSesi, refreshSekali, simpanSesi } from "$lib/server/sesi";

export const handle: Handle = async ({ event, resolve }) => {
  const akses = event.cookies.get(COOKIE_SESI);
  const refresh = event.cookies.get(COOKIE_REFRESH);
  const klaim = dekodeJwt(akses);
  event.locals.sesi = null;

  if (akses && klaim?.hh && !perluRefresh(klaim)) {
    event.locals.sesi = { tokenAkses: akses, householdId: klaim.hh };
  } else if (refresh) {
    try {
      event.locals.sesi = simpanSesi(event.cookies, await refreshSekali(refresh));
    } catch {
      hapusSesi(event.cookies); // refresh kedaluwarsa/dipakai ulang: wajib masuk lagi
    }
    if (!event.locals.sesi) hapusSesi(event.cookies);
  }

  const { pathname, search } = event.url;
  if (!event.locals.sesi && terlindungi(pathname)) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ kode: "TIDAK_SAH", pesan: "Sesi berakhir" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    redirect(303, `/masuk?lanjut=${encodeURIComponent(pathname + search)}`);
  }
  return resolve(event);
};
