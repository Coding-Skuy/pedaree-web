<script lang="ts">
  import { TARGET_STOCKOUT_PERSEN, kartuDasbor, kartuStockoutRata, labelBulan, tabelWaste, titikGrafik } from "$lib/dasbor";
  let { data } = $props();
  const kartu = $derived(data.dasbor ? [...kartuDasbor(data.dasbor), kartuStockoutRata(data.dasbor)] : []);
  const L = 600;
  const T = 160;
  const titik = $derived(data.dasbor ? titikGrafik(data.dasbor.stockoutRate90Hari, L, T) : "");
  const waste = $derived(data.dasbor ? tabelWaste(data.dasbor.wastePerKategori) : null);
  const gram = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
</script>

<svelte:head><title>Dasbor — Pedaree</title></svelte:head>

<h1>Dasbor</h1>

{#if !data.dasbor}
  <p role="alert" data-testid="dasbor-galat">{data.galat}</p>
{:else}
  <ul class="kartu" data-testid="kartu-dasbor">
    {#each kartu as k (k.kunci)}
      <li class:peringatan={k.peringatan} data-testid={`kartu-${k.kunci}`}>
        <span class="label">{k.label}</span>
        <strong>{k.nilai}</strong>
        {#if k.catatan}<small>{k.catatan}</small>{/if}
      </li>
    {/each}
  </ul>

  <section data-testid="bagian-stockout">
    <h2>Stockout rate 90 hari</h2>
    {#if data.dasbor.stockoutRate90Hari.length === 0}
      <p data-testid="stockout-kosong">Belum ada data.</p>
    {:else}
      <svg viewBox={`0 0 ${L} ${T}`} role="img" aria-label="Grafik garis stockout rate harian 90 hari terakhir" data-testid="grafik-stockout" class="grafik">
        <line x1="0" x2={L} y1={T - (TARGET_STOCKOUT_PERSEN / 100) * T} y2={T - (TARGET_STOCKOUT_PERSEN / 100) * T} class="target" />
        <polyline points={titik} fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <small>Garis putus-putus: target {TARGET_STOCKOUT_PERSEN}%. Rentang {data.dasbor.stockoutRate90Hari[0].tanggal} sampai {data.dasbor.stockoutRate90Hari.at(-1)?.tanggal}.</small>
    {/if}
  </section>

  <section data-testid="bagian-waste">
    <h2>Waste per kategori (gram)</h2>
    {#if !waste || waste.bulan.length === 0}
      <p data-testid="waste-kosong">Belum ada waste tercatat.</p>
    {:else}
      <table data-testid="tabel-waste">
        <thead>
          <tr><th>Kategori</th>{#each waste.bulan as b (b)}<th>{labelBulan(b)}</th>{/each}</tr>
        </thead>
        <tbody>
          {#each waste.kategori as kat (kat)}
            <tr data-testid={`waste-${kat}`}>
              <th scope="row">{kat}</th>
              {#each waste.bulan as b (b)}<td>{waste.sel[kat][b] === undefined ? "–" : gram.format(waste.sel[kat][b])}</td>{/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <section data-testid="bagian-sering-habis">
    <h2>10 item paling sering habis (90 hari)</h2>
    {#if data.dasbor.itemSeringHabis.length === 0}
      <p data-testid="sering-habis-kosong">Tidak ada item yang habis.</p>
    {:else}
      <ol data-testid="daftar-sering-habis">
        {#each data.dasbor.itemSeringHabis as i (i.pantryItemId)}
          <li data-testid={`sering-habis-${i.pantryItemId}`}>
            <a href={`/dapur/${encodeURIComponent(i.pantryItemId)}`}>{i.nama}</a>
            <small>{i.kategori}: habis {i.kejadianHabis}x ({i.hariHabis} hari); minimum {gram.format(i.stokMinimum)} {i.satuanTampil}</small>
          </li>
        {/each}
      </ol>
    {/if}
    <!--
      KESENJANGAN KONTRAK (tersisa): tombol "Naikkan minimum" membutuhkan endpoint ubah stokMinimum;
      openapi backend (PR #16) hanya mengekspos stokMinimum sebagai data baca. Tidak dikarang di web.
    -->
    <p class="menunggu" data-testid="menunggu-naikkan-minimum">Tombol <em>Naikkan minimum</em> menunggu endpoint ubah <code>stokMinimum</code> di kontrak backend.</p>
  </section>
{/if}

<style>
  .kartu { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.75rem; }
  .kartu li { border: 1px solid #ddd; border-radius: 0.5rem; padding: 0.75rem; display: grid; gap: 0.25rem; }
  .kartu li.peringatan { border-color: #9a6700; background: #fff8e1; }
  .label { font-size: 0.85rem; color: #555; }
  strong { font-size: 1.6rem; }
  section { margin-top: 1.5rem; }
  .grafik { width: 100%; max-width: 40rem; height: auto; color: #0b5cad; border: 1px solid #ddd; }
  .target { stroke: #9a6700; stroke-dasharray: 4 4; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #ddd; padding: 0.25rem 0.6rem; text-align: right; }
  th:first-child { text-align: left; }
  .menunggu { color: #555; }
</style>
