<template>
  <div class="vue-app-demo">
    <h1>VTT-DnD5 - Vue Demo</h1>
    <p>Componente Vue integrado correctamente</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const message = ref('¡Hola desde Vue!');
</script>

<style scoped>
.vue-app-demo {
  padding: 2rem;
  font-family: 'Cinzel', serif;
}
</style>
