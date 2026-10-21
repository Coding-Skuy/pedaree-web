/** Status sesi sisi klien: 401 pada fetch klien memunculkan dialog masuk ulang (AC PDR-WEB-003). */
export const sesiKlien = $state({ perluMasukUlang: false });

/** `fetch` untuk mutasi dari browser: selalu `no-store`; 401 membuka dialog, bukan error diam. */
export async function fetchKlien(input: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(input, { ...init, cache: "no-store" });
  if (res.status === 401) sesiKlien.perluMasukUlang = true;
  return res;
}
