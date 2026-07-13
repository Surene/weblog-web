<template>
  <div class="container" style="padding-top:60px">

    <div v-if="loading">
      <SkeletonArticle :lines="6" />
      <SkeletonList :count="5" style="margin-top:32px" />
    </div>
    <div v-else-if="!latest" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      <p>暂无文章</p>
      <span>去后台创建你的第一篇文章吧</span>
    </div>
    <article v-else>
      <div style="margin-bottom:48px">
        <h2 style="font-size:28px;font-weight:400;margin-bottom:8px;color:var(--text)">
          <span v-if="latest.isTop" class="pinned-badge" title="置顶文章">
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

      <div v-if="others.length">
        <h2 class="year-heading">最新文章</h2>
          <ul class="article-list">
            <li v-for="a in others" :key="a.id" class="article-item">
              <span class="title">
                <span v-if="a.isTop" class="pinned-badge" title="置顶文章">
                  <svg viewBox="0 0 24 24"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/></svg>
                  置顶
                </span>
                <router-link :to="getArticleUrl(a)">{{ a.title }}</router-link>
              </span>
              <span class="date">{{ formatDate(a.publishedAt) }}</span>
          </li>
          <li class="article-item">
            <span class="title"><router-link to="/archives" class="view-more-link">更多文章 &raquo;</router-link></span>
          </li>
        </ul>

      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SkeletonArticle from '../components/SkeletonArticle.vue'
import SkeletonList from '../components/SkeletonList.vue'
import { articleApi } from '../api/article.js'
import { siteApi } from '../api/site.js'

const latest = ref(null)
const others = ref([])
const loading = ref(false)
const siteName = ref('My Blog')

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

onMounted(async () => {
  loading.value = true
  try { const r = await siteApi.getConfig(); siteName.value = (r.data||{}).site_name||'My Blog' } catch(e){}
  try {
    const r = await articleApi.getList({page:1,size:10})
    const all = r.data?.records||[]
    latest.value = all[0]||null
    others.value = all.slice(1)
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
