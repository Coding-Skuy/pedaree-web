import { describe, expect, it } from "vitest";
import { statusStok } from "./stok";

describe("statusStok", () => {
  it("habis bila nol", () => {
    expect(statusStok(0, 250)).toBe("habis");
  });
  it("menipis di bawah batas", () => {
    expect(statusStok(100, 250)).toBe("menipis");
  });
});
