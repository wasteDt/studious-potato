<template>
  <header class="topbar">
    <div>
      <p class="eyebrow">School Logistics Energy Center</p>
      <h1>{{ title }}</h1>
    </div>
    <div class="header-actions">
      <span>数据日期：2026-05-27</span>
      <span>JSON Server 模拟接口</span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || '总览')
</script>
