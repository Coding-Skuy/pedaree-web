import { describe, expect, it } from "vitest";
import { dekodeJwt, lanjutAman, perluRefresh, terlindungi } from "./sesi";

function jwt(klaim: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64({ alg: "EdDSA" })}.${b64(klaim)}.sig`;
}

describe("dekodeJwt", () => {
  it("membaca klaim hh dan exp", () => {
    expect(dekodeJwt(jwt({ hh: "hh_01J9", exp: 100, aud: "pedaree" }))).toMatchObject({ hh: "hh_01J9", exp: 100 });
  });
  it("null untuk token rusak atau kosong", () => {
    expect(dekodeJwt(undefined)).toBeNull();
    expect(dekodeJwt("bukan-jwt")).toBeNull();
    expect(dekodeJwt("a.%%%.c")).toBeNull();
  });
});

describe("perluRefresh", () => {
  it("true bila hampir/lewat kedaluwarsa atau tanpa exp", () => {
    expect(perluRefresh({ exp: 1000 }, 990)).toBe(true);
    expect(perluRefresh({ exp: 1000 }, 1001)).toBe(true);
    expect(perluRefresh(null)).toBe(true);
  });
  it("false bila masih panjang", () => {
    expect(perluRefresh({ exp: 1000 }, 100)).toBe(false);
  });
});

describe("lanjutAman", () => {
  it("menerima path internal", () => {
    expect(lanjutAman("/dapur/itm_1?x=1")).toBe("/dapur/itm_1?x=1");
  });
  it("menolak open redirect", () => {
    expect(lanjutAman("//jahat.example")).toBe("/dapur");
    expect(lanjutAman("https://jahat.example")).toBe("/dapur");
    expect(lanjutAman("/\\jahat")).toBe("/dapur");
    expect(lanjutAman(null)).toBe("/dapur");
  });
});

describe("terlindungi", () => {
  it("rute produk dilindungi, /masuk tidak", () => {
    expect(terlindungi("/dapur")).toBe(true);
    expect(terlindungi("/dapur/itm_1")).toBe(true);
    expect(terlindungi("/dasbor")).toBe(true);
    expect(terlindungi("/api/pakai")).toBe(true);
    expect(terlindungi("/masuk")).toBe(false);
    expect(terlindungi("/dapurku")).toBe(false);
  });
});
