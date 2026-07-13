<template>
  <div class="page-layout" style="padding-top:60px">
    <div class="page-main">
      <div v-if="loading" class="spinner"></div>
      <div v-else-if="!latest" class="empty">No articles yet.</div>
      <article v-else>
        <div style="margin-bottom:48px">
          <h2 style="font-size:28px;font-weight:400;margin-bottom:8px;color:var(--text)">
            <span v-if="isPinned(latest)" class="pinned-badge" title="置顶文章">
              <svg viewBox="0 0 24 24"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/></svg>
              置顶
            </span>
            <router-link :to="getArticleUrl(latest)" style="color:var(--text)">{{ latest.title }}</router-link>
          </h2>
          <div style="font-size:13px;color:var(--text-lighter);margin-bottom:16px">
            {{ formatDate(latest.publishedAt) }}
            <span v-if="latest.categoryName" style="margin-left:12px">
              分类：<router-link :to="'/category/'+latest.categorySlug">{{ latest.categoryName }}</router-link>
            </span>
          </div>
          <div style="margin-left:24px;padding-left:20px;border-left:3px solid #e6e2dc">
            <p style="font-size:15px;color:#555;line-height:2;margin:0 0 12px">
              {{ firstSentence }}
            </p>
            <router-link :to="getArticleUrl(latest)" style="font-size:13px;color:#c75450;text-decoration:none">
              阅读全文 &raquo;
            </router-link>
          </div>
        </div>

        <h2 style="font-size:18px;font-weight:700;margin:36px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border-light);color:var(--text)">
          最近的 {{ articles.length }} 篇文章（共 {{ total }} 篇）
        </h2>

        <ul class="article-list">
          <li v-for="a in articles" :key="a.id" class="article-item">
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

        <div v-if="totalPages>1" class="pagination">
          <a v-if="page>1" href="javascript:void(0)" @click="goPage(page-1)">&laquo; Prev</a>
          <span v-else class="disabled">&laquo; Prev</span>
          <span v-for="p in pages" :key="p">
            <span v-if="p===page" class="current">{{ p }}</span>
            <a v-else href="javascript:void(0)" @click="goPage(p)">{{ p }}</a>
          </span>
          <a v-if="page<totalPages" href="javascript:void(0)" @click="goPage(page+1)">Next &raquo;</a>
          <span v-else class="disabled">Next &raquo;</span>
        </div>
      </article>
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
import { siteApi } from '../api/site.js'
import { usePinned } from '../composables/usePinned.js'

const route = useRoute()
const articles = ref([])
const categories = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const pageSize = 20
const latest = ref(null)
const siteName = ref('My Blog')
const { isPinned, sortByPinnedThenDate } = usePinned()

const firstSentence = computed(() => {
  if (!latest.value) return ''
  if (latest.value.summary) return latest.value.summary
  if (!latest.value.contentMd) return ''
  const text = latest.value.contentMd
    .replace(/!\[.*?\]\([\s\S]*?\)/g, '')
    .replace(/!\[[^\]]*\]/g, '')
    .replace(/\[\[.*?\]\]/g, '')
    .replace(/#{1,6}\s/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*?`/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/^\s+/gm, '')
    .trim()
  const match = text.match(/^.{10,}?[?.!\uff1f\n]/)
  return match ? match[0].trim() : text.substring(0, 100)
})

const totalPages = computed(() => Math.ceil(total.value/pageSize)||1)
const pages = computed(() => Array.from({length:totalPages.value},(_,i)=>i+1))

onMounted(async () => {
  loading.value = true
  try { const r = await siteApi.getConfig(); siteName.value = (r.data||{}).site_name||'My Blog' } catch(e){}
  try { const r = await categoryApi.getAll(); categories.value = r.data||[] } catch(e){}
  try {
    const r = await articleApi.getList({page:1,size:10})
    const all = sortByPinnedThenDate(r.data?.records||[])
    latest.value = all[0]||null
  } catch(e){}
  await loadArticles()
  loading.value = false
})

async function loadArticles() {
  try {
    const r = await articleApi.getList({page:page.value,size:pageSize})
    const all = sortByPinnedThenDate(r.data?.records||[])
    articles.value = (page.value===1 && latest.value) ? all.filter(a=>a.id!==latest.value.id) : all
    total.value = r.data?.total||0
  } catch(e){}
}

function goPage(p) { page.value = p; loadArticles(); window.scrollTo({top:0}) }
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
