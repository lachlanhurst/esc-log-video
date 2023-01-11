<script setup>
import HelloWorld from './components/HelloWorld.vue'
import Main from './components/Main.vue'
</script>

<template>
  <Main class="main" />
</template>

<style scoped>

.main {
  height: 100%;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
