import type { DasborWeb } from "$lib/api/tipe";

/** Target waste bulanan per rumah tangga (metrik/10 bab 3; AGENTS.md): kurang dari 1.500 g. */
export const TARGET_WASTE_GRAM = 1500;

export interface KartuDasbor {
  kunci: keyof DasborWeb;
  label: string;
  nilai: string;
  /** Hanya penanda tampilan; angka metrik tetap dari server. */
  peringatan: boolean;
  catatan?: string;
}

const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

/** Memetakan respons `GET /web/dashboard` ke kartu tampilan. Tidak menghitung metrik sendiri. */
export function kartuDasbor(d: DasborWeb): KartuDasbor[] {
  return [
    { kunci: "totalItemAktif", label: "Item aktif", nilai: angka.format(d.totalItemAktif), peringatan: false },
    { kunci: "menipis", label: "Menipis", nilai: angka.format(d.menipis), peringatan: d.menipis > 0 },
    { kunci: "habis", label: "Habis", nilai: angka.format(d.habis), peringatan: d.habis > 0 },
    {
      kunci: "segeraKedaluwarsa3Hari",
      label: "Segera kedaluwarsa (3 hari)",
      nilai: angka.format(d.segeraKedaluwarsa3Hari),
      peringatan: d.segeraKedaluwarsa3Hari > 0,
    },
    {
      kunci: "wasteBulanGram",
      label: "Waste bulan ini",
      nilai: `${angka.format(d.wasteBulanGram)} g`,
      peringatan: d.wasteBulanGram >= TARGET_WASTE_GRAM,
      catatan: `Target kurang dari ${angka.format(TARGET_WASTE_GRAM)} g per bulan`,
    },
    { kunci: "sinyalTerkirim7Hari", label: "Sinyal ke TitipO (7 hari)", nilai: angka.format(d.sinyalTerkirim7Hari), peringatan: false },
  ];
}
