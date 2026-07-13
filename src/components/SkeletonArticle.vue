<template>
  <div class="skeleton-article">
    <div class="skeleton-title"></div>
    <div class="skeleton-meta"></div>
    <div class="skeleton-content">
      <div v-for="i in lines" :key="i" class="skeleton-line" :style="{ width: lineWidths[i-1] }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ lines: { type: Number, default: 8 } })
const lineWidths = computed(() => {
  return Array.from({ length: props.lines }, (_, i) => {
    const widths = ['100%', '95%', '100%', '90%', '100%', '85%', '100%', '60%']
    return widths[i % widths.length]
  })
})
</script>

<style scoped>
.skeleton-article { padding: 20px 0; }
.skeleton-title { height: 28px; width: 70%; background: linear-gradient(90deg, #f0ece6 25%, #e6e2dc 50%, #f0ece6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-bottom: 12px; }
.skeleton-meta { height: 14px; width: 40%; background: linear-gradient(90deg, #f0ece6 25%, #e6e2dc 50%, #f0ece6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 3px; margin-bottom: 32px; }
.skeleton-content { display: flex; flex-direction: column; gap: 10px; }
.skeleton-line { height: 16px; background: linear-gradient(90deg, #f0ece6 25%, #e6e2dc 50%, #f0ece6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 3px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
