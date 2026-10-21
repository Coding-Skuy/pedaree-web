<script lang="ts">
  import { KATEGORI, STATUS_STOK } from "$lib/api/tipe";
  import { LABEL_STATUS, formatJumlah } from "$lib/format";
  let { data } = $props();
</script>

<svelte:head><title>Daftar dapur — Pedaree</title></svelte:head>

<h1>Daftar dapur</h1>

<form method="GET" class="filter" data-testid="filter-dapur">
  <input name="q" placeholder="Cari bahan" value={data.filter.q} />
  <select name="kategori" aria-label="Kategori">
    <option value="">Semua kategori</option>
    {#each KATEGORI as k}<option value={k} selected={k === data.filter.kategori}>{k}</option>{/each}
  </select>
  <select name="statusStok" aria-label="Status stok">
    <option value="">Semua status</option>
    {#each STATUS_STOK as s}<option value={s} selected={s === data.filter.statusStok}>{LABEL_STATUS[s]}</option>{/each}
  </select>
  <button type="submit">Terapkan</button>
</form>

{#if data.halaman.data.length === 0}
  <p data-testid="dapur-kosong">Belum ada bahan yang cocok.</p>
{:else}
  <table data-testid="tabel-dapur">
    <thead><tr><th>Bahan</th><th>Kategori</th><th>Stok</th><th>Status</th><th>Kedaluwarsa terdekat</th><th>Lokasi</th></tr></thead>
    <tbody>
      {#each data.halaman.data as item (item.id)}
        <tr>
          <td><a href={`/dapur/${item.id}`}>{item.nama}</a></td>
          <td>{item.kategori}</td>
          <td>{formatJumlah(item.stokTampil, item.satuanTampil)}</td>
          <td class={`status-${item.statusStok.toLowerCase()}`}>{LABEL_STATUS[item.statusStok]}</td>
          <td>{item.batchTerdekatKedaluwarsa ?? "-"}</td>
          <td>{item.lokasiDefault}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

{#if data.halaman.nextCursor}
  <p><a data-testid="berikutnya" href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(data.filter).filter(([, v]) => v)), cursor: data.halaman.nextCursor })}`}>Berikutnya</a></p>
{/if}

<style>
  .filter { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #eee; }
  .status-menipis { color: #9a6700; }
  .status-habis { color: #b00020; }
</style>
