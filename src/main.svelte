<script lang="ts">
  let count: number = 0;
  const increment = () => count++;
  const decrement = () => count--;
</script>

<div class="svelte-app-demo">
  <h1>VTT-DnD5 - Svelte Demo</h1>
  <p>Componente Svelte integrado correctamente</p>
  <div class="counter">
    <button on:click={decrement}>-</button>
    <span>{count}</span>
    <button on:click={increment}>+</button>
  </div>
</div>

<style>
  .svelte-app-demo {
    padding: 2rem;
    font-family: 'Cinzel', serif;
  }
  .counter {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 1rem;
  }
  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
