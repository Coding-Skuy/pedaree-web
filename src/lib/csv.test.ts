import { describe, expect, it } from "vitest";
import { KOLOM_IMPOR, MAKS_BARIS, MAKS_BYTE, namaBerkasStok, periksaRentang, praperiksaCsv, tanggalWib } from "./csv";

const header = KOLOM_IMPOR.join(",");
const baris = "Bayam,SAYUR,500,gram,2026-10-20,2026-10-25,KULKAS_BAWAH";

describe("praperiksaCsv", () => {
  it("menerima berkas valid dan menghitung baris data", () => {
    expect(praperiksaCsv(`${header}\n${baris}\n${baris}\n`, 200)).toEqual({ ok: true, baris: 2 });
  });
  it("menerima tepat 200 baris, menolak 201", () => {
    const isi = (n: number) => [header, ...Array(n).fill(baris)].join("\n");
    expect(praperiksaCsv(isi(MAKS_BARIS), 1000).ok).toBe(true);
    expect(praperiksaCsv(isi(MAKS_BARIS + 1), 1000)).toMatchObject({ ok: false });
  });
  it("menolak berkas di atas 512 KB tetapi menerima tepat 512 KB", () => {
    expect(praperiksaCsv(`${header}\n${baris}`, MAKS_BYTE).ok).toBe(true);
    expect(praperiksaCsv(`${header}\n${baris}`, MAKS_BYTE + 1)).toMatchObject({ ok: false });
  });
  it("menolak header salah urutan atau kolom kurang", () => {
    expect(praperiksaCsv(`jumlah,nama\n1,x`, 10)).toMatchObject({ ok: false });
    expect(praperiksaCsv(`${KOLOM_IMPOR.slice().reverse().join(",")}\n${baris}`, 10)).toMatchObject({ ok: false });
  });
  it("menolak kosong, hanya header, dan mengabaikan BOM serta CRLF", () => {
    expect(praperiksaCsv("", 0)).toMatchObject({ ok: false });
    expect(praperiksaCsv(header, 10)).toMatchObject({ ok: false });
    expect(praperiksaCsv(`﻿${header}\r\n${baris}\r\n`, 10)).toEqual({ ok: true, baris: 1 });
  });
});

describe("nama berkas ekspor", () => {
  it("memakai tanggal WIB: 2026-10-20 18:00 UTC sudah 21 Oktober di WIB", () => {
    expect(tanggalWib(new Date("2026-10-20T18:00:00Z"))).toBe("2026-10-21");
    expect(namaBerkasStok(new Date("2026-10-20T18:00:00Z"))).toBe("pedaree-stok-20261021.csv");
    expect(namaBerkasStok(new Date("2026-10-20T10:00:00Z"))).toBe("pedaree-stok-20261020.csv");
  });
});

describe("periksaRentang", () => {
  it("menerima rentang valid dan menamai berkas", () => {
    expect(periksaRentang("2026-10-01", "2026-10-21")).toEqual({ ok: true, dari: "2026-10-01", sampai: "2026-10-21", nama: "pedaree-mutasi-20261001-20261021.csv" });
  });
  it("boleh sebagian atau kosong", () => {
    expect(periksaRentang(null, null, new Date("2026-10-21T00:00:00Z"))).toMatchObject({ ok: true, nama: "pedaree-mutasi-awal-20261021.csv" });
  });
  it("menolak format, tanggal mustahil, dan dari > sampai", () => {
    expect(periksaRentang("21-10-2026", null)).toMatchObject({ ok: false });
    expect(periksaRentang("2026-02-30", null)).toMatchObject({ ok: false });
    expect(periksaRentang("2026-10-22", "2026-10-21")).toMatchObject({ ok: false });
  });
});
