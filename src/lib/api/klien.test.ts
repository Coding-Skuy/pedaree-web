import { describe, expect, it } from "vitest";
import { ApiError, buatKlien } from "./klien";

interface Panggilan {
  url: string;
  init: RequestInit;
}

function palsu(status: number, badan: unknown) {
  const panggilan: Panggilan[] = [];
  const f = (async (url: string, init: RequestInit) => {
    panggilan.push({ url, init });
    return new Response(JSON.stringify(badan), { status, headers: { "content-type": "application/json" } });
  }) as unknown as typeof fetch;
  return { f, panggilan };
}

const opsi = { baseUrl: "http://api.test/v1/", tokenAkses: "tok", householdId: "hh_1", buatRequestId: () => "11111111-1111-4111-8111-111111111111" };

describe("buatKlien", () => {
  it("mengirim X-Household-Id, X-Request-Id, bearer, cookie sesi, dan no-store", async () => {
    const { f, panggilan } = palsu(200, { data: [], nextCursor: null });
    await buatKlien({ ...opsi, fetch: f }).daftarItem({ q: "bayam", limit: 20 });
    const { url, init } = panggilan[0];
    expect(url).toBe("http://api.test/v1/pantry/items?q=bayam&limit=20");
    const h = init.headers as Record<string, string>;
    expect(h["X-Household-Id"]).toBe("hh_1");
    expect(h["X-Request-Id"]).toBe("11111111-1111-4111-8111-111111111111");
    expect(h.Authorization).toBe("Bearer tok");
    expect(h.Cookie).toBe("pedaree_sess=tok");
    expect(init.cache).toBe("no-store");
  });

  it("mutasi POST mengirim JSON dan no-store", async () => {
    const { f, panggilan } = palsu(200, { terpotong: [], kurang: [] });
    await buatKlien({ ...opsi, fetch: f }).catatPakai({ pemakaian: [{ pantryItemId: "itm_1", jumlah: 200, satuan: "gram" }] });
    const { init } = panggilan[0];
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body as string).pemakaian[0].jumlah).toBe(200);
    expect(init.cache).toBe("no-store");
  });

  it("tanpa token: tidak ada Authorization/Cookie (login)", async () => {
    const { f, panggilan } = palsu(200, { tokenAkses: "a", tokenRefresh: "r", kedaluwarsaDetik: 900, audiens: "pedaree" });
    await buatKlien({ baseUrl: "http://api.test", fetch: f }).login({ idPengguna: "u", kataSandi: "p" });
    const h = panggilan[0].init.headers as Record<string, string>;
    expect(h.Authorization).toBeUndefined();
    expect(h.Cookie).toBeUndefined();
  });

  it("401 menjadi ApiError tidakSah dengan kode server", async () => {
    const { f } = palsu(401, { kode: "TIDAK_SAH", pesan: "Token tidak sah" });
    const e = await buatKlien({ ...opsi, fetch: f }).detailItem("itm_1").catch((x) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e.tidakSah).toBe(true);
    expect(e.kode).toBe("TIDAK_SAH");
  });

  it("422 memuat kode dan field domain", async () => {
    const { f } = palsu(422, { kode: "STOK_HABIS", pesan: "Stok habis", field: "jumlah" });
    const e = await buatKlien({ ...opsi, fetch: f }).catatPakai({ pemakaian: [{ pantryItemId: "i", jumlah: 1, satuan: "gram" }] }).catch((x) => x);
    expect(e).toMatchObject({ status: 422, kode: "STOK_HABIS", field: "jumlah" });
  });

  it("id di path di-encode", async () => {
    const { f, panggilan } = palsu(200, {});
    await buatKlien({ ...opsi, fetch: f }).detailItem("a/b");
    expect(panggilan[0].url).toBe("http://api.test/v1/pantry/items/a%2Fb");
  });

  it("dasbor memanggil GET /web/dashboard dengan sesi", async () => {
    const { f, panggilan } = palsu(200, { totalItemAktif: 1, menipis: 0, habis: 0, segeraKedaluwarsa3Hari: 0, wasteBulanGram: 0, sinyalTerkirim7Hari: 0 });
    const d = await buatKlien({ ...opsi, fetch: f }).dasbor();
    expect(panggilan[0].url).toBe("http://api.test/v1/web/dashboard");
    expect(d.totalItemAktif).toBe(1);
    expect((panggilan[0].init.headers as Record<string, string>).Cookie).toBe("pedaree_sess=tok");
  });

  it("imporCsv mengirim multipart `berkas` tanpa Content-Type manual", async () => {
    const { f, panggilan } = palsu(202, { diterima: 1, ditolak: 1, galatBaris: [{ baris: 3, pesan: "satuan tidak berlaku" }] });
    const h = await buatKlien({ ...opsi, fetch: f }).imporCsv(new Blob(["a,b"], { type: "text/csv" }), "stok.csv");
    const { url, init } = panggilan[0];
    expect(url).toBe("http://api.test/v1/web/import/csv");
    expect(init.body).toBeInstanceOf(FormData);
    expect(((init.body as FormData).get("berkas") as File).name).toBe("stok.csv");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
    expect(h.galatBaris[0]).toEqual({ baris: 3, pesan: "satuan tidak berlaku" });
  });

  it("ekspor stok/mutasi meneruskan kueri dan mengembalikan teks CSV", async () => {
    const f = (async (url: string) => new Response(`url=${url}`, { status: 200 })) as unknown as typeof fetch;
    const k = buatKlien({ ...opsi, fetch: f });
    expect(await k.eksporStokCsv("SAYUR")).toBe("url=http://api.test/v1/web/export/csv?kategori=SAYUR");
    expect(await k.eksporMutasiCsv("2026-10-01", "2026-10-21")).toBe("url=http://api.test/v1/web/export/mutasi?dari=2026-10-01&sampai=2026-10-21");
  });

  it("parcel DITERIMA dan draf masuk memakai endpoint /web/titipo", async () => {
    const { f, panggilan } = palsu(200, { data: [], draf: [] });
    const k = buatKlien({ ...opsi, fetch: f });
    await k.daftarParcelTitipo();
    await k.draftMasukDariParcel("pcl 1");
    expect(panggilan[0].url).toBe("http://api.test/v1/web/titipo/parcels?status=DITERIMA");
    expect(panggilan[1].url).toBe("http://api.test/v1/web/titipo/parcels/pcl%201/draft-masuk");
    expect(panggilan[1].init.method).toBe("POST");
  });

  it("catatMasuk mengirim sumber MASUK_TITIPO", async () => {
    const { f, panggilan } = palsu(201, { id: "btc_1" });
    await buatKlien({ ...opsi, fetch: f }).catatMasuk({ pantryItemId: "itm_1", jumlah: 500, satuan: "gram", tanggalMasuk: "2026-10-21", lokasi: "KULKAS_BAWAH", sumber: "MASUK_TITIPO" });
    expect(panggilan[0].url).toBe("http://api.test/v1/pantry/batches");
    expect(JSON.parse(panggilan[0].init.body as string).sumber).toBe("MASUK_TITIPO");
  });
});
