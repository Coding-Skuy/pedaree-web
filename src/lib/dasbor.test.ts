import { describe, expect, it } from "vitest";
import type { DasborWeb } from "$lib/api/tipe";
import { TARGET_WASTE_GRAM, kartuDasbor } from "./dasbor";

const dasar: DasborWeb = { totalItemAktif: 12, menipis: 0, habis: 0, segeraKedaluwarsa3Hari: 0, wasteBulanGram: 800.5, sinyalTerkirim7Hari: 3 };

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
