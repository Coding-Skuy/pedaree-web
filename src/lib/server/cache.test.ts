import { describe, expect, it } from "vitest";
import { CacheTtl } from "./cache";

describe("CacheTtl (60 detik)", () => {
  it("memakai hasil cache sebelum TTL dan memuat ulang sesudahnya", async () => {
    let t = 0;
    let n = 0;
    const c = new CacheTtl<number>(60_000, () => t);
    const muat = async () => ++n;
    expect(await c.ambil("k", muat)).toBe(1);
    t = 59_999;
    expect(await c.ambil("k", muat)).toBe(1);
    t = 60_001;
    expect(await c.ambil("k", muat)).toBe(2);
  });

  it("galat tidak di-cache", async () => {
    const c = new CacheTtl<number>(60_000, () => 0);
    await expect(c.ambil("k", async () => Promise.reject(new Error("x")))).rejects.toThrow();
    expect(await c.ambil("k", async () => 7)).toBe(7);
  });

  it("batalkan menghapus hanya kunci berawalan", async () => {
    const c = new CacheTtl<string>(60_000, () => 0);
    await c.ambil("hh_1|a", async () => "x");
    await c.ambil("hh_2|a", async () => "y");
    c.batalkan("hh_1|");
    expect(await c.ambil("hh_1|a", async () => "baru")).toBe("baru");
    expect(await c.ambil("hh_2|a", async () => "baru")).toBe("y");
  });
});
