<template>
  <section class="stat-card">
    <span class="stat-label">{{ label }}</span>
    <strong>{{ value }}</strong>
    <small :class="trendClass">{{ trend }}</small>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: String, default: '' },
  tone: { type: String, default: 'neutral' }
})

const trendClass = computed(() => `trend trend-${props.tone}`)
</script>
