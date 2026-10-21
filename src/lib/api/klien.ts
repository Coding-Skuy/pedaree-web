import type {
  AppError,
  BatchBuat,
  DrafMasukItem,
  ImporCsvHasil,
  ParcelTitipo,
  StokBatch,
  DasborWeb,
  HalamanItem,
  Kategori,
  LoginRequest,
  PantryItemDetail,
  PemakaianHasil,
  PemakaianRequest,
  StatusStok,
  TokenPasangan,
} from "./tipe";

export const COOKIE_SESI = "pedaree_sess";

/** Galat API terstruktur (`{kode, pesan, field}`) beserta status HTTP. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly kode: string,
    pesan: string,
    public readonly field: string | null = null,
  ) {
    super(pesan);
    this.name = "ApiError";
  }
  get tidakSah(): boolean {
    return this.status === 401;
  }
}

export interface KlienOpsi {
  /** Mis. `http://localhost:8080` atau `https://api.pedaree.chefgenie.id/v1`. */
  baseUrl: string;
  fetch?: typeof fetch;
  tokenAkses?: string;
  householdId?: string;
  /** Pembangkit X-Request-Id; bisa diganti di uji. */
  buatRequestId?: () => string;
}

interface Minta {
  query?: Record<string, string | number | undefined | null>;
  body?: unknown;
}

export type Klien = ReturnType<typeof buatKlien>;

export function buatKlien(opsi: KlienOpsi) {
  const f = opsi.fetch ?? fetch;
  const baseUrl = opsi.baseUrl.replace(/\/+$/, "");
  const requestId = opsi.buatRequestId ?? (() => crypto.randomUUID());

  function header(tambahan: Record<string, string> = {}): Record<string, string> {
    const h: Record<string, string> = { "X-Request-Id": requestId(), Accept: "application/json", ...tambahan };
    if (opsi.householdId) h["X-Household-Id"] = opsi.householdId;
    if (opsi.tokenAkses) {
      h.Authorization = `Bearer ${opsi.tokenAkses}`;
      // Endpoint `/web/*` memakai cookieAuth; SSR meneruskan sesi sebagai cookie (asumsi, lihat ADR-0004).
      h.Cookie = `${COOKIE_SESI}=${opsi.tokenAkses}`;
    }
    return h;
  }

  function url(path: string, query?: Minta["query"]): string {
    const u = new URL(baseUrl + path);
    for (const [k, v] of Object.entries(query ?? {})) {
      if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
    }
    return u.toString();
  }

  async function galat(res: Response): Promise<ApiError> {
    let badan: Partial<AppError> = {};
    try {
      badan = await res.json();
    } catch {
      /* badan bukan JSON */
    }
    return new ApiError(res.status, badan.kode ?? "GALAT_TAK_DIKENAL", badan.pesan ?? res.statusText, badan.field ?? null);
  }

  async function minta<T>(method: "GET" | "POST", path: string, { query, body }: Minta = {}): Promise<T> {
    const res = await f(url(path, query), {
      method,
      headers: header(body === undefined ? {} : { "Content-Type": "application/json" }),
      body: body === undefined ? undefined : JSON.stringify(body),
      // Mutasi dan data per pengguna tidak boleh di-cache oleh fetch (AC PDR-WEB-003).
      cache: "no-store",
    });
    if (!res.ok) throw await galat(res);
    return (await res.json()) as T;
  }

  /** Respons mentah (CSV/multipart). `body` FormData: Content-Type diisi otomatis oleh fetch. */
  async function mentah(method: "GET" | "POST", path: string, { query, body }: { query?: Minta["query"]; body?: FormData } = {}): Promise<Response> {
    const res = await f(url(path, query), { method, headers: header(), body, cache: "no-store" });
    if (!res.ok) throw await galat(res);
    return res;
  }

  return {
    login: (b: LoginRequest) => minta<TokenPasangan>("POST", "/auth/login", { body: b }),
    refresh: (tokenRefresh: string) => minta<TokenPasangan>("POST", "/auth/refresh", { body: { tokenRefresh } }),
    daftarItem: (q: { q?: string; kategori?: Kategori; statusStok?: StatusStok; limit?: number; cursor?: string } = {}) =>
      minta<HalamanItem>("GET", "/pantry/items", { query: q }),
    detailItem: (id: string) => minta<PantryItemDetail>("GET", `/pantry/items/${encodeURIComponent(id)}`),
    catatPakai: (b: PemakaianRequest) => minta<PemakaianHasil>("POST", "/pantry/consume", { body: b }),
    dasbor: () => minta<DasborWeb>("GET", "/web/dashboard"),
    catatMasuk: (b: BatchBuat) => minta<StokBatch>("POST", "/pantry/batches", { body: b }),
    imporCsv: async (berkas: Blob, nama = "impor.csv") => {
      const fd = new FormData();
      fd.set("berkas", berkas, nama);
      return (await (await mentah("POST", "/web/import/csv", { body: fd })).json()) as ImporCsvHasil;
    },
    eksporStokCsv: async (kategori?: Kategori) => (await mentah("GET", "/web/export/csv", { query: { kategori } })).text(),
    eksporMutasiCsv: async (dari?: string, sampai?: string) => (await mentah("GET", "/web/export/mutasi", { query: { dari, sampai } })).text(),
    daftarParcelTitipo: () => minta<{ data: ParcelTitipo[] }>("GET", "/web/titipo/parcels", { query: { status: "DITERIMA" } }),
    draftMasukDariParcel: (id: string) => minta<{ draf: DrafMasukItem[] }>("POST", `/web/titipo/parcels/${encodeURIComponent(id)}/draft-masuk`),
  };
}
