import { describe, expect, it } from "vitest";
import type { DasborWeb } from "$lib/api/tipe";
import { TARGET_STOCKOUT_PERSEN, TARGET_WASTE_GRAM, kartuDasbor, kartuStockoutRata, labelBulan, tabelWaste, titikGrafik } from "./dasbor";

const dasar: DasborWeb = { totalItemAktif: 12, menipis: 0, habis: 0, segeraKedaluwarsa3Hari: 0, wasteBulanGram: 800.5, sinyalTerkirim7Hari: 3,
  stockoutRate90Hari: [], stockoutRateRata90Hari: 4.2, wastePerKategori: [], itemSeringHabis: [],
};

describe("kartuDasbor", () => {
  it("memetakan keenam angka server apa adanya", () => {
    const k = kartuDasbor(dasar);
    expect(k.map((x) => x.kunci)).toEqual(["totalItemAktif", "menipis", "habis", "segeraKedaluwarsa3Hari", "wasteBulanGram", "sinyalTerkirim7Hari"]);
    expect(k.find((x) => x.kunci === "totalItemAktif")?.nilai).toBe("12");
    expect(k.find((x) => x.kunci === "wasteBulanGram")?.nilai).toBe("800,5 g");
  });

  it("tidak ada peringatan saat semua aman", () => {
    expect(kartuDasbor(dasar).some((x) => x.peringatan)).toBe(false);
  });

  it("menandai menipis, habis, kedaluwarsa dekat bila > 0", () => {
    const k = kartuDasbor({ ...dasar, menipis: 2, habis: 1, segeraKedaluwarsa3Hari: 4 });
    for (const kunci of ["menipis", "habis", "segeraKedaluwarsa3Hari"]) expect(k.find((x) => x.kunci === kunci)?.peringatan).toBe(true);
  });

  it("waste di batas atau di atas target 1.500 g ditandai", () => {
    expect(kartuDasbor({ ...dasar, wasteBulanGram: TARGET_WASTE_GRAM - 0.1 }).find((x) => x.kunci === "wasteBulanGram")?.peringatan).toBe(false);
    expect(kartuDasbor({ ...dasar, wasteBulanGram: TARGET_WASTE_GRAM }).find((x) => x.kunci === "wasteBulanGram")?.peringatan).toBe(true);
  });
});

describe("kartuStockoutRata", () => {
  it("menandai di atas target 8%", () => {
    expect(kartuStockoutRata(dasar).peringatan).toBe(false);
    expect(kartuStockoutRata({ ...dasar, stockoutRateRata90Hari: TARGET_STOCKOUT_PERSEN }).peringatan).toBe(false);
    expect(kartuStockoutRata({ ...dasar, stockoutRateRata90Hari: 8.1 }).peringatan).toBe(true);
    expect(kartuStockoutRata(dasar).nilai).toBe("4,2%");
  });
});

describe("titikGrafik", () => {
  it("memetakan 0..100% ke koordinat SVG tanpa mengubah nilai", () => {
    const d = [{ tanggal: "2026-10-01", stockoutRate: 0 }, { tanggal: "2026-10-02", stockoutRate: 50 }, { tanggal: "2026-10-03", stockoutRate: 100 }];
    expect(titikGrafik(d, 200, 100)).toBe("0.0,100.0 100.0,50.0 200.0,0.0");
  });
  it("deret kosong dan satu titik", () => {
    expect(titikGrafik([], 200, 100)).toBe("");
    expect(titikGrafik([{ tanggal: "2026-10-01", stockoutRate: 10 }], 200, 100)).toBe("0.0,90.0");
  });
});

describe("tabelWaste", () => {
  it("memutar baris bulan x kategori mengikuti urutan server", () => {
    const t = tabelWaste([
      { bulan: "2026-08", kategori: "SAYUR", wasteGram: 100 },
      { bulan: "2026-09", kategori: "SAYUR", wasteGram: 50 },
      { bulan: "2026-09", kategori: "BUMBU", wasteGram: 7 },
    ]);
    expect(t.bulan).toEqual(["2026-08", "2026-09"]);
    expect(t.kategori).toEqual(["SAYUR", "BUMBU"]);
    expect(t.sel.SAYUR["2026-08"]).toBe(100);
    expect(t.sel.BUMBU["2026-08"]).toBeUndefined();
  });
  it("labelBulan", () => {
    expect(labelBulan("2026-10")).toBe("Okt 2026");
    expect(labelBulan("rusak")).toBe("rusak");
  });
});
