import type { DasborWeb } from "$lib/api/tipe";

/** Target waste bulanan per rumah tangga (metrik/10 bab 3; AGENTS.md): kurang dari 1.500 g. */
export const TARGET_WASTE_GRAM = 1500;

/** Target stockout rate rata-rata 90 hari (metrik/10 bab 2): kurang dari atau sama dengan 8%. */
export const TARGET_STOCKOUT_PERSEN = 8;

export type TitikStockout = DasborWeb["stockoutRate90Hari"][number];
export type BarisWaste = DasborWeb["wastePerKategori"][number];

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

/** Kartu tambahan untuk rata-rata stockout 90 hari (angka dari server, hanya dibandingkan dengan target). */
export function kartuStockoutRata(d: DasborWeb): KartuDasbor {
  return {
    kunci: "stockoutRateRata90Hari",
    label: "Stockout rata-rata 90 hari",
    nilai: `${angka.format(d.stockoutRateRata90Hari)}%`,
    peringatan: d.stockoutRateRata90Hari > TARGET_STOCKOUT_PERSEN,
    catatan: `Target kurang dari atau sama dengan ${TARGET_STOCKOUT_PERSEN}%`,
  };
}

/** Pemetaan semata-mata untuk gambar: deret server -> titik koordinat SVG (sumbu Y 0..100%). Tanpa menghitung ulang metrik. */
export function titikGrafik(deret: readonly TitikStockout[], lebar: number, tinggi: number): string {
  if (deret.length === 0) return "";
  const langkah = deret.length > 1 ? lebar / (deret.length - 1) : 0;
  return deret
    .map((t, i) => `${(i * langkah).toFixed(1)},${(tinggi - (Math.min(Math.max(t.stockoutRate, 0), 100) / 100) * tinggi).toFixed(1)}`)
    .join(" ");
}

export interface TabelWaste {
  bulan: string[];
  kategori: string[];
  /** sel[kategori][bulan] dalam gram; kategori/bulan tanpa baris dari server tidak ada. */
  sel: Record<string, Record<string, number>>;
}

/** Memutar baris server (bulan x kategori) menjadi tabel; urutan bulan/kategori mengikuti urutan server. */
export function tabelWaste(baris: readonly BarisWaste[]): TabelWaste {
  const bulan: string[] = [];
  const kategori: string[] = [];
  const sel: Record<string, Record<string, number>> = {};
  for (const b of baris) {
    if (!bulan.includes(b.bulan)) bulan.push(b.bulan);
    if (!kategori.includes(b.kategori)) kategori.push(b.kategori);
    (sel[b.kategori] ??= {})[b.bulan] = b.wasteGram;
  }
  return { bulan, kategori, sel };
}

/** "2026-10" -> "Okt 2026". */
export function labelBulan(bulan: string): string {
  const [t, m] = bulan.split("-");
  const nama = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][Number(m) - 1];
  return nama ? `${nama} ${t}` : bulan;
}
