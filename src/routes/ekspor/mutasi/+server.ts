import { json } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import { periksaRentang } from "$lib/csv";
import { klienUntuk } from "$lib/server/sesi";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
  const r = periksaRentang(url.searchParams.get("dari") || null, url.searchParams.get("sampai") || null);
  if (!r.ok) return json({ kode: "VALIDASI_GAGAL", pesan: r.pesan }, { status: 400 });
  try {
    const csv = await klienUntuk(locals.sesi!).eksporMutasiCsv(r.dari, r.sampai);
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${r.nama}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return json({ kode: e.kode, pesan: e.message, field: e.field }, { status: e.status });
    throw e;
  }
};
