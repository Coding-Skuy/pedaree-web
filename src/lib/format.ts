import type { Satuan, StatusStok } from "$lib/api/tipe";

/** Tampilan angka: bilangan bulat tanpa desimal, selainnya maksimal 1 desimal (BR-102). */
export function formatJumlah(n: number, satuan: Satuan): string {
  const bulat = Number.isInteger(n);
  return `${bulat ? n : n.toFixed(1)} ${satuan}`;
}

export const LABEL_STATUS: Record<StatusStok, string> = { AMAN: "Aman", MENIPIS: "Menipis", HABIS: "Habis" };
