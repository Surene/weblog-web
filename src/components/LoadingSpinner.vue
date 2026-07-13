<template>
  <div class="loading-wrapper">
    <div class="loading-spinner">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({ text: { type: String, default: '加载中...' } })
</script>

<style scoped>
.loading-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; }
.loading-spinner { display: flex; gap: 6px; margin-bottom: 16px; }
.loading-dot { width: 10px; height: 10px; background: #5566cc; border-radius: 50%; animation: bounce 1.4s ease-in-out infinite both; }
.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }
.loading-dot:nth-child(3) { animation-delay: 0s; }
.loading-text { font-size: 14px; color: #999; letter-spacing: 1px; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
</style>
