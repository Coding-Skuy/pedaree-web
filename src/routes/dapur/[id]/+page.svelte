<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { fetchKlien } from "$lib/klien-fetch.svelte";
  import { formatJumlah } from "$lib/format";
  let { data } = $props();

  let jumlah = $state("");
  let pesan = $state("");
  let sibuk = $state(false);

  async function catatPakai(e: SubmitEvent) {
    e.preventDefault();
    sibuk = true;
    pesan = "";
    const res = await fetchKlien("/api/pakai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pantryItemId: data.item.id, jumlah: Number(jumlah), satuan: data.item.satuanSimpan }),
    });
    sibuk = false;
    if (res.ok) {
      jumlah = "";
      pesan = "Pemakaian dicatat (FEFO dihitung server).";
      await invalidateAll();
    } else if (res.status !== 401) {
      pesan = (await res.json().catch(() => ({ pesan: "Gagal mencatat" }))).pesan;
    }
  }
</script>

<svelte:head><title>{data.item.nama} — Pedaree</title></svelte:head>

<p><a href="/dapur">&larr; Daftar dapur</a></p>
<h1>{data.item.nama}</h1>
<p data-testid="stok-tampil">Stok: {formatJumlah(data.item.stokTampil, data.item.satuanStok)} ({data.item.kategori}, minimum {formatJumlah(data.item.stokMinimum, data.item.satuanSimpan)})</p>

<h2>Batch (urut FEFO)</h2>
{#if data.item.batches.length === 0}
  <p>Tidak ada batch aktif.</p>
{:else}
  <table data-testid="tabel-batch">
    <thead><tr><th>Batch</th><th>Sisa</th><th>Masuk</th><th>Kedaluwarsa</th><th>Lokasi</th><th>Status</th></tr></thead>
    <tbody>
      {#each data.item.batches as b (b.id)}
        <tr>
          <td>{b.id}</td>
          <td>{formatJumlah(b.jumlahAktif, data.item.satuanSimpan)}</td>
          <td>{b.tanggalMasuk}</td>
          <td>{b.tanggalKedaluwarsa ?? "-"}</td>
          <td>{b.lokasi}</td>
          <td>{b.status}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<h2>Catat pakai</h2>
<form onsubmit={catatPakai} data-testid="form-pakai">
  <label>Jumlah ({data.item.satuanSimpan}) <input type="number" min="0" step="any" bind:value={jumlah} required /></label>
  <button type="submit" disabled={sibuk}>Catat pakai</button>
</form>
{#if pesan}<p role="status">{pesan}</p>{/if}
