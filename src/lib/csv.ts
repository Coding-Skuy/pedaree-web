/** Batas impor CSV (AGENTS.md; openapi `/web/import/csv`): maksimal 200 baris data dan 512 KB. */
export const MAKS_BARIS = 200;
export const MAKS_BYTE = 512 * 1024;
export const KOLOM_IMPOR = ["nama", "kategori", "jumlah", "satuan", "tanggalMasuk", "tanggalKedaluwarsa", "lokasi"] as const;

export type HasilPraperiksa = { ok: true; baris: number } | { ok: false; pesan: string };

/**
 * Praperiksa ringan di sisi web agar berkas yang jelas ditolak tidak diunggah.
 * Hanya bentuk berkas (ukuran, jumlah baris, header). Validasi isi (satuan, tanggal, FEFO)
 * sepenuhnya milik server; galat per baris dari server yang ditampilkan.
 */
export function praperiksaCsv(teks: string, ukuranByte: number): HasilPraperiksa {
  if (ukuranByte > MAKS_BYTE) return { ok: false, pesan: `Berkas ${Math.ceil(ukuranByte / 1024)} KB melebihi batas 512 KB` };
  const lines = teks.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { ok: false, pesan: "Berkas kosong" };
  const header = lines[0].split(",").map((k) => k.trim());
  if (header.length !== KOLOM_IMPOR.length || KOLOM_IMPOR.some((k, i) => header[i] !== k)) {
    return { ok: false, pesan: `Header harus persis: ${KOLOM_IMPOR.join(",")}` };
  }
  const baris = lines.length - 1;
  if (baris === 0) return { ok: false, pesan: "Tidak ada baris data" };
  if (baris > MAKS_BARIS) return { ok: false, pesan: `${baris} baris melebihi batas ${MAKS_BARIS} baris` };
  return { ok: true, baris };
}

/** Tanggal `YYYYMMDD` menurut WIB (UTC+7) untuk nama berkas `pedaree-stok-YYYYMMDD.csv`. */
export function tanggalWib(d: Date): string {
  const wib = new Date(d.getTime() + 7 * 3600_000);
  return wib.toISOString().slice(0, 10);
}

export function namaBerkasStok(d: Date = new Date()): string {
  return `pedaree-stok-${tanggalWib(d).replaceAll("-", "")}.csv`;
}

const TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

function tanggalValid(s: string): boolean {
  if (!TANGGAL.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export type HasilRentang = { ok: true; dari?: string; sampai?: string; nama: string } | { ok: false; pesan: string };

/** Validasi rentang ekspor mutasi (`dari`..`sampai`, `YYYY-MM-DD`, dari <= sampai). */
export function periksaRentang(dari: string | null, sampai: string | null, sekarang: Date = new Date()): HasilRentang {
  if (dari && !tanggalValid(dari)) return { ok: false, pesan: "Tanggal 'dari' harus YYYY-MM-DD yang valid" };
  if (sampai && !tanggalValid(sampai)) return { ok: false, pesan: "Tanggal 'sampai' harus YYYY-MM-DD yang valid" };
  if (dari && sampai && dari > sampai) return { ok: false, pesan: "Tanggal 'dari' tidak boleh setelah 'sampai'" };
  const nama = `pedaree-mutasi-${(dari ?? "awal").replaceAll("-", "")}-${(sampai ?? tanggalWib(sekarang)).replaceAll("-", "")}.csv`;
  return { ok: true, dari: dari ?? undefined, sampai: sampai ?? undefined, nama };
}
