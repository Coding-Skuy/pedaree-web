import type { Cookies } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { buatKlien, type Klien } from "$lib/api/klien";
import type { TokenPasangan } from "$lib/api/tipe";
import { COOKIE_REFRESH, UMUR_AKSES_DETIK, UMUR_REFRESH_DETIK, dekodeJwt, type Sesi } from "$lib/sesi";
import { COOKIE_SESI } from "$lib/api/klien";

export function baseUrlApi(): string {
  return env.PEDAREE_API_URL ?? "http://localhost:8080";
}

export function klienUntuk(sesi: Sesi | null, f?: typeof fetch): Klien {
  return buatKlien({ baseUrl: baseUrlApi(), fetch: f, tokenAkses: sesi?.tokenAkses, householdId: sesi?.householdId });
}

const aman = () => env.PEDAREE_COOKIE_AMAN !== "false";

export function simpanSesi(cookies: Cookies, t: TokenPasangan): Sesi | null {
  const hh = dekodeJwt(t.tokenAkses)?.hh;
  if (!hh) return null;
  const dasar = { path: "/", httpOnly: true, sameSite: "lax", secure: aman() } as const;
  cookies.set(COOKIE_SESI, t.tokenAkses, { ...dasar, maxAge: UMUR_AKSES_DETIK });
  cookies.set(COOKIE_REFRESH, t.tokenRefresh, { ...dasar, maxAge: UMUR_REFRESH_DETIK });
  return { tokenAkses: t.tokenAkses, householdId: hh };
}

export function hapusSesi(cookies: Cookies): void {
  cookies.delete(COOKIE_SESI, { path: "/" });
  cookies.delete(COOKIE_REFRESH, { path: "/" });
}

// Refresh token sekali pakai (reuse-detection): permintaan paralel dengan refresh yang sama
// harus berbagi satu panggilan, kalau tidak server mencabut seluruh sesi.
const refreshBerjalan = new Map<string, Promise<TokenPasangan>>();

export function refreshSekali(tokenRefresh: string, f?: typeof fetch): Promise<TokenPasangan> {
  let p = refreshBerjalan.get(tokenRefresh);
  if (!p) {
    p = klienUntuk(null, f)
      .refresh(tokenRefresh)
      .finally(() => setTimeout(() => refreshBerjalan.delete(tokenRefresh), 5_000));
    refreshBerjalan.set(tokenRefresh, p);
  }
  return p;
}
