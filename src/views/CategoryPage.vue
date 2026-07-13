<template>
  <div class="page-layout" style="padding-top:60px">
    <div class="page-main">
      <div v-if="loading" class="spinner"></div>
      <div v-else-if="articles.length===0" class="empty">No articles in this category.</div>
      <template v-else>
        <h2 style="font-size:18px;font-weight:700;margin:36px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border-light);color:var(--text)">
          分类：{{ categoryName }} （共 {{ total }} 篇）
        </h2>

        <template v-for="(group, year) in groupedArticles" :key="year">
          <h2 class="year-heading">{{ year }}</h2>
          <ul class="article-list">
            <li v-for="a in group" :key="a.id" class="article-item">
              <span class="title">
                <span v-if="isPinned(a)" class="pinned-badge" title="置顶文章">
                  <svg viewBox="0 0 24 24"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/></svg>
                  置顶
                </span>
                <router-link :to="getArticleUrl(a)">{{ a.title }}</router-link>
              </span>
              <span class="date">{{ formatDate(a.publishedAt) }}</span>
            </li>
          </ul>
        </template>
      </template>
    </div>

    <aside class="page-sidebar">
      <div class="sidebar-title">分类</div>
      <ul class="sidebar-cats">
        <li v-for="c in categories" :key="c.id">
          <router-link :to="'/category/'+c.slug" :class="{active:route.params.slug===c.slug}">{{ c.name }}</router-link>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { articleApi } from '../api/article.js'
import { categoryApi } from '../api/category.js'
import { usePinned } from '../composables/usePinned.js'

const route = useRoute()
const articles = ref([])
const categories = ref([])
const loading = ref(false)
const categoryName = ref('')
const total = ref(0)
const { isPinned, sortByPinnedThenDate } = usePinned()

const groupedArticles = computed(() => {
  const g = {}
  for (const a of articles.value) {
    const y = new Date(a.publishedAt).getFullYear()
    if (!g[y]) g[y] = []
    g[y].push(a)
  }
  return g
})

onMounted(async () => {
  loading.value = true
  try { const cr = await categoryApi.getAll(); categories.value = cr.data||[] } catch(e){}
  try {
    const slug = route.params.slug
    const cat = categories.value.find(c=>c.slug===slug)
    categoryName.value = cat?.name||slug
    if(cat) {
      const r = await articleApi.getList({page:1,size:100,categoryId:cat.id})
      articles.value = sortByPinnedThenDate(r.data?.records||[])
      total.value = r.data?.total||0
    }
  } catch(e){} finally { loading.value = false }
})

function getArticleUrl(art) {
  if (!art || !art.publishedAt || !art.categorySlug) return '#'
  const d = new Date(art.publishedAt)
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  return `/article/${art.categorySlug}/${y}/${m}/${art.slug}`
}

function formatDate(d) {
  if(!d) return ''
  const dt = new Date(d)
  return dt.getFullYear()+'.'+String(dt.getMonth()+1).padStart(2,'0')+'.'+String(dt.getDate()).padStart(2,'0')
}
</script>
