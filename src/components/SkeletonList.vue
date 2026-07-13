<template>
  <div class="skeleton-list">
    <div v-for="i in count" :key="i" class="skeleton-item">
      <div class="skeleton-dot"></div>
      <div class="skeleton-text">
        <div class="skeleton-line-title"></div>
        <div class="skeleton-line-date"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 5 } })
</script>

<style scoped>
.skeleton-list { display: flex; flex-direction: column; gap: 8px; }
.skeleton-item { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; }
.skeleton-dot { width: 6px; height: 6px; border-radius: 50%; background: #e6e2dc; margin-top: 8px; flex-shrink: 0; }
.skeleton-text { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.skeleton-line-title { height: 16px; width: 85%; background: linear-gradient(90deg, #f0ece6 25%, #e6e2dc 50%, #f0ece6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 3px; }
.skeleton-line-date { height: 12px; width: 30%; background: linear-gradient(90deg, #f0ece6 25%, #e6e2dc 50%, #f0ece6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 2px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
