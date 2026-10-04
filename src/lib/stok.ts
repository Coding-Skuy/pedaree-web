export type StatusStok = "tersedia" | "menipis" | "habis";
export type StatusKedaluwarsa = "aman" | "segera" | "lewat";

export interface PantryItem {
  id: string;
  nama: string;
  satuan: string;
  jumlah: number;
  kedaluwarsa: string;
}

export function statusStok(jumlah: number, batasMenipis: number): StatusStok {
  if (jumlah <= 0) return "habis";
  if (jumlah < batasMenipis) return "menipis";
  return "tersedia";
}

export async function ambilStok(api: string): Promise<PantryItem[]> {
  const res = await fetch(`${api}/v1/stok`, { cache: "no-store" });
  if (!res.ok) throw new Error("gagal mengambil stok");
  return res.json();
}
