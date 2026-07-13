<template>
  <div class="container" style="padding-top:60px">
    <h1 class="page-title">搜索</h1>
    <div style="margin-bottom:32px">
      <input
        v-model="keyword"
        placeholder="搜索文章..."
        class="search-input"
        @keyup.enter="doSearch"
        ref="inputRef"
      />
      <button class="search-btn" @click="doSearch">搜索</button>
    </div>

    <LoadingSpinner v-if="loading" text="搜索中..." />
        <div v-else-if="searched && articles.length===0" class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>未找到相关文章</p><span>换个关键词试试</span></div>
    <div v-else-if="articles.length>0">
      <p style="font-size:13px;color:#999;margin-bottom:20px">共找到 {{ articles.length }} 篇相关文章</p>
      <div v-for="a in articles" :key="a.id" class="search-result-item">
        <h3 class="search-result-title">
          <span v-if="isPinned(a)" class="pinned-badge" title="置顶文章">
            <svg viewBox="0 0 24 24"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/></svg>
            置顶
          </span>
          <router-link :to="getArticleUrl(a)">{{ a.title }}</router-link>
        </h3>
        <div class="search-result-meta">
          {{ formatDate(a.publishedAt) }}
          <span v-if="a.categoryName"> · {{ a.categoryName }}</span>
        </div>
        <p class="search-result-snippet" v-html="getSnippet(a)"></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useRoute } from 'vue-router'
import { articleApi } from '../api/article.js'
import { usePinned } from '../composables/usePinned.js'

const route = useRoute()
const keyword = ref('')
const articles = ref([])
const loading = ref(false)
const searched = ref(false)
const searchedKeyword = ref('')
const inputRef = ref(null)
const { isPinned, sortByPinnedThenDate } = usePinned()

onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q
    doSearch()
  }
  inputRef.value?.focus()
})

async function doSearch() {
  if (!keyword.value.trim()) return
  loading.value = true
  searched.value = true
  searchedKeyword.value = keyword.value
  try {
    const r = await articleApi.getList({ page:1, size:50, keyword: keyword.value })
    articles.value = sortByPinnedThenDate(r.data?.records||[])
  } catch(e){} finally { loading.value = false }
}

function getSnippet(article) {
  const kw = searchedKeyword.value.trim()
  if (!kw) return ''
  const text = (article.contentMd || article.summary || '').replace(/[#*`\[\]()!_~>|-]/g, ' ')
  const lower = text.toLowerCase()
  const kwLower = kw.toLowerCase()
  const idx = lower.indexOf(kwLower)
  if (idx === -1) return text.substring(0, 150) + '...'
  const start = Math.max(0, idx - 60)
  const end = Math.min(text.length, idx + kw.length + 100)
  let snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '')
  const regex = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
  snippet = snippet.replace(regex, '<mark>$1</mark>')
  return snippet
}

function getArticleUrl(art) {
  if (!art || !art.publishedAt || !art.categorySlug) return '#'
  const dt = new Date(art.publishedAt)
  const y = dt.getFullYear()
  const m = String(dt.getMonth()+1).padStart(2,'0')
  return '/article/' + art.categorySlug + '/' + y + '/' + m + '/' + art.slug
}

function formatDate(d) {
  if(!d) return ''
  const dt = new Date(d)
  return dt.getFullYear()+'.'+String(dt.getMonth()+1).padStart(2,'0')+'.'+String(dt.getDate()).padStart(2,'0')
}
</script>

<style scoped>
.search-input {
  width: 400px; max-width: 100%;
  border: 1px solid #ddd; padding: 8px 14px; font-size: 15px;
  border-radius: 2px; outline: none; font-family: inherit;
}
.search-input:focus { border-color: #5566cc; }
.search-btn {
  margin-left: 8px; padding: 8px 18px;
  background: #5566cc; color: #fff; border: none; border-radius: 2px;
  font-size: 14px; cursor: pointer; font-family: inherit;
}
.search-btn:hover { background: #4455aa; }
.search-result-item { padding: 20px 0; border-bottom: 1px solid #f0ece6; }
.search-result-title { font-size: 17px; font-weight: 600; margin: 0 0 4px; }
.search-result-title a { color: #333; text-decoration: none; }
.search-result-title a:hover { color: #5566cc; }
.search-result-meta { font-size: 12px; color: #aaa; margin-bottom: 8px; }
.search-result-snippet { font-size: 14px; color: #666; line-height: 1.7; margin: 0; }
.search-result-snippet :deep(mark) { background: #fff3a8; padding: 0 2px; border-radius: 2px; }
</style>
