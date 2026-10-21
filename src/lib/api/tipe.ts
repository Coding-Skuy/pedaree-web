// Alias tipe dari skema tergenerate (`schema.d.ts`, hasil `bun run gen:api`).
// Nama field mengikuti server; dilarang menyimpang dari kontrak (AGENTS.md butir 11).
import type { components } from "./schema";

type S = components["schemas"];

export type AppError = S["AppError"];
export type Satuan = S["Satuan"];
export type Kategori = S["Kategori"];
export type LokasiSimpan = S["LokasiSimpan"];
export type StatusStok = S["StatusStok"];
export type StatusKedaluwarsa = S["StatusKedaluwarsa"];
export type LoginRequest = S["LoginRequest"];
export type TokenPasangan = S["TokenPasangan"];
export type PantryItemRingkas = S["PantryItemRingkas"];
export type PantryItemDetail = S["PantryItemDetail"];
export type StokBatch = S["StokBatch"];
export type PemakaianRequest = S["PemakaianRequest"];
export type PemakaianHasil = S["PemakaianHasil"];
export type DasborWeb = S["DasborWeb"];
export type ImporCsvHasil = S["ImporCsvHasil"];
export type ParcelTitipo = S["ParcelTitipo"];
export type BatchBuat = S["BatchBuat"];
export type DrafMasukItem = S["DrafMasukItem"];

export interface HalamanItem {
  data: PantryItemRingkas[];
  nextCursor: string | null;
}

export const KATEGORI: readonly Kategori[] = ["SAYUR", "BUMBU", "BUAH", "PROTEIN", "KERING", "CAIR", "BEKU", "SISA"];
export const STATUS_STOK: readonly StatusStok[] = ["AMAN", "MENIPIS", "HABIS"];
export const SATUAN: readonly Satuan[] = ["gram", "kg", "ml", "liter", "sdm", "sdt", "pcs", "siung", "buah", "ikat", "batang", "bonggol", "lembar"];
