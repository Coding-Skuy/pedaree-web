<script lang="ts">
  import { enhance } from "$app/forms";
  import { KATEGORI } from "$lib/api/tipe";
  import { KOLOM_IMPOR, MAKS_BARIS } from "$lib/csv";
  let { form } = $props();
  let sibuk = $state(false);
</script>

<svelte:head><title>Impor/Ekspor CSV — Pedaree</title></svelte:head>

<h1>Impor/Ekspor CSV</h1>

<section>
  <h2>Impor stok</h2>
  <p>Maksimal {MAKS_BARIS} baris dan 512 KB. Kolom (urut): <code>{KOLOM_IMPOR.join(",")}</code>.</p>
  <form
    method="POST"
    action="?/impor"
    enctype="multipart/form-data"
    data-testid="form-impor"
    use:enhance={() => {
      sibuk = true;
      return async ({ update }) => {
        await update();
        sibuk = false;
      };
    }}
  >
    <input type="file" name="berkas" accept=".csv,text/csv" required />
    <button type="submit" disabled={sibuk}>Impor</button>
  </form>

  {#if form && "pesan" in form && form.pesan}<p role="alert" class="galat" data-testid="impor-galat">{form.pesan}</p>{/if}
  {#if form && "hasil" in form && form.hasil}
    <p role="status" data-testid="impor-hasil">Diterima {form.hasil.diterima} baris, ditolak {form.hasil.ditolak} baris.</p>
    {#if form.hasil.galatBaris.length > 0}
      <table data-testid="galat-baris">
        <thead><tr><th>Baris</th><th>Masalah</th></tr></thead>
        <tbody>
          {#each form.hasil.galatBaris as g (g.baris)}<tr><td>{g.baris}</td><td>{g.pesan}</td></tr>{/each}
        </tbody>
      </table>
    {/if}
  {/if}
</section>

<section>
  <h2>Ekspor stok</h2>
  <form method="GET" action="/ekspor/stok" data-testid="form-ekspor-stok">
    <select name="kategori" aria-label="Kategori">
      <option value="">Semua kategori</option>
      {#each KATEGORI as k}<option value={k}>{k}</option>{/each}
    </select>
    <button type="submit">Unduh pedaree-stok-YYYYMMDD.csv</button>
  </form>
</section>

<section>
  <h2>Ekspor mutasi (audit)</h2>
  <form method="GET" action="/ekspor/mutasi" data-testid="form-ekspor-mutasi">
    <label>Dari <input type="date" name="dari" /></label>
    <label>Sampai <input type="date" name="sampai" /></label>
    <button type="submit">Unduh mutasi</button>
  </form>
</section>

<style>
  section { margin-bottom: 2rem; }
  form { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
  .galat { color: #b00020; }
  table { border-collapse: collapse; margin-top: 0.5rem; }
  th, td { text-align: left; padding: 0.3rem 0.6rem; border-bottom: 1px solid #eee; }
</style>
