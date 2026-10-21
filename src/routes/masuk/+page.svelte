<script lang="ts">
  let { data, form } = $props();
</script>

<svelte:head><title>Masuk — Pedaree</title></svelte:head>

<h1>Masuk</h1>
<form method="POST" data-testid="form-masuk">
  <input type="hidden" name="lanjut" value={data.lanjut} />
  <label>ID pengguna <input name="idPengguna" autocomplete="username" value={form?.idPengguna ?? ""} required /></label>
  <label>Kata sandi <input name="kataSandi" type="password" autocomplete="current-password" required /></label>
  {#if form?.pesan}<p role="alert" class="galat">{form.pesan}</p>{/if}
  <button type="submit">Masuk</button>
</form>

<style>
  form { display: grid; gap: 0.75rem; max-width: 20rem; }
  .galat { color: #b00020; }
</style>
