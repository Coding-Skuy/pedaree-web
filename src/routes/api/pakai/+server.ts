import { json } from "@sveltejs/kit";
import { ApiError } from "$lib/api/klien";
import type { PemakaianRequest } from "$lib/api/tipe";
import { cacheDapur } from "$lib/server/cache";
import { klienUntuk } from "$lib/server/sesi";
import type { RequestHandler } from "./$types";

/** Proxy mutasi `catatPakai` untuk fetch klien. FEFO tetap dihitung server (AGENTS.md bab Dilarang). */
export const POST: RequestHandler = async ({ request, locals }) => {
  const sesi = locals.sesi!;
  const b = (await request.json().catch(() => null)) as { pantryItemId?: string; jumlah?: number; satuan?: PemakaianRequest["pemakaian"][number]["satuan"] } | null;
  if (!b?.pantryItemId || !b.satuan || !(typeof b.jumlah === "number" && b.jumlah > 0)) {
    return json({ kode: "VALIDASI_GAGAL", pesan: "pantryItemId, jumlah > 0, dan satuan wajib", field: "jumlah" }, { status: 400 });
  }
  try {
    const hasil = await klienUntuk(sesi).catatPakai({
      pemakaian: [{ pantryItemId: b.pantryItemId, jumlah: b.jumlah, satuan: b.satuan }],
    });
    cacheDapur.batalkan(`${sesi.householdId}|`);
    return json(hasil);
  } catch (e) {
    if (e instanceof ApiError) return json({ kode: e.kode, pesan: e.message, field: e.field }, { status: e.status });
    throw e;
  }
};
