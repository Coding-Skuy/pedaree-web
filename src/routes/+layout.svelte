<script lang="ts">
  import DialogMasukUlang from "$lib/komponen/DialogMasukUlang.svelte";
  let { children, data } = $props();
</script>

<header>
  <a href="/" class="merek">Pedaree</a>
  {#if data.masuk}
    <nav aria-label="Utama">
      <a href="/dapur">Dapur</a>
      <a href="/dasbor">Dasbor</a>
      <a href="/impor">Impor/Ekspor</a>
      <a href="/titipo">Parcel TitipO</a>
    </nav>
    <form method="POST" action="/keluar"><button type="submit">Keluar</button></form>
  {/if}
</header>

<main data-testid="app-root">
  {@render children()}
</main>

<DialogMasukUlang />

<style>
  :global(body) { font-family: system-ui, sans-serif; margin: 0; color: #1c1c1c; }
  header { display: flex; gap: 1rem; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #ddd; }
  nav { display: flex; gap: 0.75rem; flex: 1; }
  .merek { font-weight: 700; }
  main { padding: 1rem; max-width: 60rem; margin: 0 auto; }
</style>
