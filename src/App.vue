<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="main-panel">
      <AppHeader />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>
