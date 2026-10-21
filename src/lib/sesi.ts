export const COOKIE_REFRESH = "pedaree_refresh";
/** Umur cookie akses = umur JWT akses (15 menit); refresh 7 hari (bukan 30 hari seperti produk/21). */
export const UMUR_AKSES_DETIK = 900;
export const UMUR_REFRESH_DETIK = 7 * 24 * 3600;
/** Perbarui token bila sisa umurnya di bawah ambang ini. */
export const AMBANG_REFRESH_DETIK = 30;

export interface KlaimJwt {
  hh?: string;
  sub?: string;
  exp?: number;
  aud?: string | string[];
}

export interface Sesi {
  tokenAkses: string;
  householdId: string;
}

/** Dekode payload JWT TANPA verifikasi tanda tangan (server API yang memverifikasi). Null bila rusak. */
export function dekodeJwt(token: string | undefined): KlaimJwt | null {
  if (!token) return null;
  const bagian = token.split(".");
  if (bagian.length !== 3) return null;
  try {
    const b64 = bagian[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "=")), (c) => c.charCodeAt(0)));
    const klaim = JSON.parse(json);
    return typeof klaim === "object" && klaim !== null ? (klaim as KlaimJwt) : null;
  } catch {
    return null;
  }
}

export function perluRefresh(klaim: KlaimJwt | null, sekarangDetik = Math.floor(Date.now() / 1000)): boolean {
  if (!klaim?.exp) return true;
  return klaim.exp - AMBANG_REFRESH_DETIK <= sekarangDetik;
}

/** Hanya path internal; cegah open redirect lewat `?lanjut=`. */
export function lanjutAman(lanjut: string | null | undefined, awal = "/dapur"): string {
  if (!lanjut || !lanjut.startsWith("/") || lanjut.startsWith("//") || lanjut.includes("\\")) return awal;
  return lanjut;
}

export const RUTE_TERLINDUNGI = ["/dapur", "/dasbor", "/impor", "/titipo", "/ekspor", "/api"];

export function terlindungi(path: string): boolean {
  return RUTE_TERLINDUNGI.some((r) => path === r || path.startsWith(r + "/"));
}
