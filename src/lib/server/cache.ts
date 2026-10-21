/**
 * Cache memori TTL 60 detik untuk halaman `/dapur` dan `/dapur/[id]` (AC PDR-WEB-003).
 * Asumsi: adapter Bun tidak punya ISR; "diprarender ulang tiap 60 detik" dipenuhi dengan
 * render SSR di-cache per rumah tangga + kueri, dan dibatalkan setelah mutasi.
 */
export const TTL_MS = 60_000;

export class CacheTtl<T> {
  private isi = new Map<string, { nilai: T; kadaluwarsa: number }>();
  constructor(
    private readonly ttl = TTL_MS,
    private readonly sekarang: () => number = Date.now,
  ) {}

  async ambil(kunci: string, muat: () => Promise<T>): Promise<T> {
    const ada = this.isi.get(kunci);
    if (ada && ada.kadaluwarsa > this.sekarang()) return ada.nilai;
    const nilai = await muat(); // galat tidak di-cache
    this.isi.set(kunci, { nilai, kadaluwarsa: this.sekarang() + this.ttl });
    return nilai;
  }

  /** Hapus semua kunci berawalan (mis. `hh_xxx|`). */
  batalkan(awalan: string): void {
    for (const k of this.isi.keys()) if (k.startsWith(awalan)) this.isi.delete(k);
  }
}

export const cacheDapur = new CacheTtl<unknown>();
