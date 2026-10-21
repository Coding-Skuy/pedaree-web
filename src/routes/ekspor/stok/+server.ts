import { json } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import { KATEGORI, type Kategori } from "$lib/api/tipe";
import { namaBerkasStok } from "$lib/csv";
import { klienUntuk } from "$lib/server/sesi";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
  const k = url.searchParams.get("kategori");
  if (k && !KATEGORI.includes(k as Kategori)) return json({ kode: "VALIDASI_GAGAL", pesan: "Kategori tidak dikenal", field: "kategori" }, { status: 400 });
  try {
    const csv = await klienUntuk(locals.sesi!).eksporStokCsv((k as Kategori) || undefined);
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${namaBerkasStok()}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return json({ kode: e.kode, pesan: e.message, field: e.field }, { status: e.status });
    throw e;
  }
};
