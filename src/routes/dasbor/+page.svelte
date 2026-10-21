<script lang="ts">
  import { kartuDasbor } from "$lib/dasbor";
  let { data } = $props();
  const kartu = $derived(data.dasbor ? kartuDasbor(data.dasbor) : []);
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
{/if}

<!--
  ASUMSI/KESENJANGAN KONTRAK: AC PDR-WEB-004 meminta grafik stockoutRate 90 hari, tabel waste per
  kategori (3 bulan), dan 10 item paling sering habis + "Naikkan minimum". Skema `DasborWeb` pada
  openapi backend (PR #9) hanya memuat enam angka di atas; tidak ada deret waktu, rincian kategori,
  daftar item, maupun endpoint ubah stokMinimum. Web dilarang menghitung sendiri, jadi bagian
  berikut ditampilkan sebagai "menunggu kontrak" sampai backend menambah field/endpoint-nya.
-->
<section class="menunggu" data-testid="dasbor-menunggu-kontrak">
  <h2>Menunggu kontrak backend</h2>
  <ul>
    <li data-testid="menunggu-stockout">Grafik stockoutRate 90 hari: belum ada field di <code>GET /web/dashboard</code>.</li>
    <li data-testid="menunggu-waste-kategori">Waste per kategori (bulan ini + 2 bulan sebelumnya): belum ada field di kontrak.</li>
    <li data-testid="menunggu-top-habis">10 item paling sering habis dan tombol <em>Naikkan minimum</em>: belum ada field/endpoint ubah <code>stokMinimum</code> di kontrak.</li>
  </ul>
</section>

<style>
  .kartu { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.75rem; }
  .kartu li { border: 1px solid #ddd; border-radius: 0.5rem; padding: 0.75rem; display: grid; gap: 0.25rem; }
  .kartu li.peringatan { border-color: #9a6700; background: #fff8e1; }
  .label { font-size: 0.85rem; color: #555; }
  strong { font-size: 1.6rem; }
  .menunggu { margin-top: 2rem; color: #555; }
</style>
