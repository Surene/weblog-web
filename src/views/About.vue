<template>
  <div class="container" style="padding-top:60px">
    <article class="article-detail">
      <h1 style="font-size:28px;font-weight:400;margin-bottom:24px">关于</h1>
      <div class="content" v-html="renderedContent"></div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { siteApi } from '../api/site.js'

const aboutContent = ref('')

const renderedContent = computed(() => {
  if (!aboutContent.value) return ''
  try { return marked.parse(aboutContent.value) } catch { return aboutContent.value }
})

onMounted(async () => {
  try {
    const r = await siteApi.getConfig()
    aboutContent.value = r.data?.about_content || ''
  } catch(e){}
  document.title = '关于'
})
</script>