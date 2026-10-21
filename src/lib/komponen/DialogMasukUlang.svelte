<script lang="ts">
  import { page } from "$app/state";
  import { sesiKlien } from "$lib/klien-fetch.svelte";
  const lanjut = $derived(encodeURIComponent(page.url.pathname + page.url.search));
</script>

{#if sesiKlien.perluMasukUlang}
  <div class="tirai" role="presentation">
    <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="judul-dialog" data-testid="dialog-masuk-ulang">
      <h2 id="judul-dialog">Sesi berakhir</h2>
      <p>Masuk lagi untuk melanjutkan. Perubahan yang belum tersimpan tidak hilang di layar ini.</p>
      <a class="tombol" href={`/masuk?lanjut=${lanjut}`}>Masuk ulang</a>
      <button type="button" onclick={() => (sesiKlien.perluMasukUlang = false)}>Tutup</button>
    </div>
  </div>
{/if}

<style>
  .tirai { position: fixed; inset: 0; background: rgb(0 0 0 / 0.45); display: grid; place-items: center; }
  .dialog { background: #fff; padding: 1.5rem; border-radius: 0.5rem; max-width: 24rem; }
  .tombol { margin-right: 0.5rem; }
</style>
