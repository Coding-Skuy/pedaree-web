<script lang="ts">
  import { enhance } from "$app/forms";
  let { data, form } = $props();
</script>

<svelte:head><title>Parcel TitipO — Pedaree</title></svelte:head>

<h1>Parcel TitipO</h1>
<p>Parcel berstatus DITERIMA dapat dijadikan draf Catat Masuk. Draf belum mengubah stok sampai disimpan.</p>

{#if data.galat}<p role="alert" data-testid="parcel-galat">{data.galat}</p>{/if}

{#if data.parcels.length === 0 && !data.galat}
  <p data-testid="parcel-kosong">Tidak ada parcel yang menunggu.</p>
{:else}
  <ul data-testid="daftar-parcel">
    {#each data.parcels as p (p.id)}
      <li>
        <code>{p.id}</code> ({p.status})
        <form method="POST" action="?/draf" use:enhance>
          <input type="hidden" name="parcelId" value={p.id} />
          <button type="submit">Jadikan draf Catat Masuk</button>
        </form>
      </li>
    {/each}
  </ul>
{/if}

{#if form && "pesan" in form && form.pesan}<p role="alert" class="galat" data-testid="titipo-galat">{form.pesan}</p>{/if}

{#if form && "draf" in form && form.draf}
  <h2>Draf dari {form.parcelId}</h2>
  <form method="POST" action="?/simpan" use:enhance data-testid="form-draf">
    <table>
      <thead><tr><th>Item</th><th>Jumlah</th><th>Satuan</th></tr></thead>
      <tbody>
        {#each form.draf as d (d.pantryItemId)}
          <tr>
            <td><input type="hidden" name="pantryItemId" value={d.pantryItemId} />{d.pantryItemId}</td>
            <td><input type="number" name="jumlah" min="0" step="any" value={d.jumlah} required /></td>
            <td><input type="hidden" name="satuan" value={d.satuan} />{d.satuan}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button type="submit">Simpan sebagai Catat Masuk</button>
  </form>
{/if}

{#if form && "tersimpan" in form && form.tersimpan && !("pesan" in form && form.pesan)}
  <p role="status" data-testid="titipo-tersimpan">{form.tersimpan.length} batch dicatat masuk.</p>
{/if}

<style>
  .galat { color: #b00020; }
  table { border-collapse: collapse; margin: 0.5rem 0; }
  th, td { text-align: left; padding: 0.3rem 0.6rem; border-bottom: 1px solid #eee; }
  li form { display: inline; margin-left: 0.5rem; }
</style>
