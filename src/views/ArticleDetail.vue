<template>
  <div class="reading-progress" :style="progressStyle"></div>
  <div class="container">
    <LoadingSpinner v-if="loading" text="文章加载中..." />
    <div v-else-if="!article" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/></svg>
      <p>文章未找到</p>
      <span>该文章可能已被删除或不存在</span>
    </div>
    <template v-else>
      <nav class="breadcrumb-bar" v-if="article.categorySlug">
        <div class="breadcrumb-left">
          <span class="breadcrumb-site">{{ siteName }}</span>
          <span class="breadcrumb-sep">&raquo;</span>
          <router-link to="/blog">首页</router-link>
          <span class="breadcrumb-sep">&raquo;</span>
          <router-link :to="'/category/' + article.categorySlug">{{ article.categoryName }}</router-link>
        </div>
        <div class="breadcrumb-right">
          <div v-if="prev">上一篇：<router-link :to="getArticleUrl(prev)">{{ prev.title }}</router-link></div>
          <div v-if="next">下一篇：<router-link :to="getArticleUrl(next)">{{ next.title }}</router-link></div>
        </div>
      </nav>
      <article class="article-detail">
        <h1>
          <span v-if="isPinned(article)" class="pinned-badge" title="置顶文章">
            <svg viewBox="0 0 24 24"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/></svg>
            置顶
          </span>
          {{ article.title }}
        </h1>
        <div class="meta">
          {{ formatDate(article.publishedAt) }}
          <span v-if="showViewCount && article.viewCount"> · {{ article.viewCount }} 阅读</span>
        </div>
        <div class="content" ref="contentRef" v-html="renderedContent"></div>

        <section class="comments-section">
          <h2 class="comments-title">留言 ({{ totalCommentCount }})</h2>
          <div v-if="!commentEnabled" class="no-comments" style="margin-bottom:24px">评论已关闭</div>
          <div v-if="commentEnabled" class="comment-form">
            <div class="form-row">
              <input v-model="commentForm.authorName" placeholder="昵称 *" class="form-input" />
              <input v-model="commentForm.authorEmail" placeholder="邮箱 *" class="form-input" />
              <input v-model="commentForm.authorUrl" placeholder="网址 (可选)" class="form-input form-input-url" />
            </div>
            <textarea ref="textareaRef" v-model="commentForm.content" placeholder="写下你的评论..." class="form-textarea" rows="4"></textarea>
            <div class="form-actions">
              <span v-if="commentForm.parentId" class="reply-hint">
                回复 {{ replyTarget?.authorName || "" }}
                <button class="cancel-reply" @click="cancelReply">取消</button>
              </span>
              <button class="submit-btn" @click="submitComment" :disabled="submitting">
                {{ submitting ? "提交中..." : "发表评论" }}
              </button>
            </div>
          </div>
          <div v-if="commentEnabled && flatComments.length === 0" class="no-comments">暂无评论，来发表第一条评论吧。</div>
          <div v-for="c in flatComments" :key="c.id" class="comment-item">
            <div class="comment-main">
              <div class="comment-header">
                <a v-if="c.authorUrl" :href="formatUrl(c.authorUrl)" target="_blank" class="comment-author">{{ c.authorName }}</a>
                <span v-else class="comment-name">{{ c.authorName }}</span>
                <span v-if="c.authorName === bloggerName" class="author-badge">作者</span>
                <span class="comment-date">{{ formatDateTime(c.createdAt) }}</span>
              </div>
              <div v-if="getReplyQuote(c)" class="comment-quote">
                <div class="quote-author">@{{ getReplyQuote(c).authorName }}</div>
                <div class="quote-text">{{ getReplyQuote(c).content }}</div>
              </div>
              <div class="comment-body" v-html="renderMd(c.content)"></div>
              <button class="reply-btn" @click="setReply(c)">回复</button>
            </div>
          </div>
        </section>
      </article>
    </template>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import axios from 'axios'
import { articleApi } from '../api/article.js'
import { commentApi } from '../api/comment.js'
import { usePinned } from '../composables/usePinned.js'

const route = useRoute()
const article = ref(null)
const prev = ref(null)
const next = ref(null)
const loading = ref(false)
const { isPinned } = usePinned()
const comments = ref([])
const submitting = ref(false)
const replyTarget = ref(null)
const textareaRef = ref(null)
const siteName = ref('')
const bloggerName = ref('博主')
const commentEnabled = ref(true)
const scrollPercent = ref(0)
const progressStyle = computed(() => ({ width: scrollPercent.value + '%' }))
const showViewCount = ref(true)
const commentMap = ref({})
const commentForm = ref({ authorName: '', authorEmail: '', authorUrl: '', content: '', parentId: null })



const totalCommentCount = computed(() => Object.keys(commentMap.value).length)

const flatComments = computed(() => {
  const list = Object.values(commentMap.value)
  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return list
})

async function loadSiteConfig() {
  try {
    const r = await axios.get('/api/public/site')
    if (r.data?.data?.blogger_name) bloggerName.value = r.data.data.blogger_name
    if (r.data?.data?.site_name) siteName.value = r.data.data.site_name
    if (r.data?.data?.comment_enabled) commentEnabled.value = r.data.data.comment_enabled === 'true'
    if (r.data?.data?.show_view_count) showViewCount.value = r.data.data.show_view_count === 'true'
  } catch (e) {}
}


function renderMd(text) {
  if (!text) return ''
  try { return marked.parse(text) } catch { return text }
}

function getReplyQuote(c) {
  if (!c.parentId) return null
  return commentMap.value[c.parentId] || null
}

function showToast(msg, type) {
  const div = document.createElement('div')
  div.textContent = msg
  div.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:4px;font-size:14px;z-index:9999;'
  if (type === 'success') { div.style.background = '#67c23a'; div.style.color = '#fff' }
  else if (type === 'warning') { div.style.background = '#e6a23c'; div.style.color = '#fff' }
  else if (type === 'error') { div.style.background = '#f56c6c'; div.style.color = '#fff' }
  else { div.style.background = '#909399'; div.style.color = '#fff' }
  document.body.appendChild(div)
  setTimeout(() => div.remove(), 3000)
}

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value
    return hljs.highlightAuto(code).value
  }
})

const renderedContent = computed(() => {
  if (!article.value?.contentMd) return ''
  try { return marked.parse(article.value.contentMd) } catch { return article.value.contentMd }
})

function flattenComments(list) {
  const map = {}
  function walk(items) {
    if (!items) return
    for (const c of items) {
      map[c.id] = c
      if (c.replies) walk(c.replies)
    }
  }
  walk(list)
  return map
}

async function loadComments(articleId) {
  try {
    const r = await commentApi.getByArticle(articleId)
    commentMap.value = flattenComments(r.data || [])
  } catch (e) { commentMap.value = {} }
}

onMounted(async () => {
  loadSiteConfig()
  loading.value = true
  try {
    const slug = route.params.slug
    const r = await articleApi.getBySlug(slug)
    article.value = r.data
    document.title = (article.value?.title || 'Article')
    loadAdjacent(slug)
    if (article.value?.id) loadComments(article.value.id)
    // Lazy load images after content renders
    setTimeout(() => {
      const imgs = document.querySelectorAll('.content img')
      imgs.forEach(img => {
        img.classList.add('loaded')
      })
    }, 100)
  } catch(e){} finally { loading.value = false }
})

watch(() => route.params.slug, async (slug) => {
  loading.value = true
  try {
    const r = await articleApi.getBySlug(slug)
    article.value = r.data
    document.title = (article.value?.title || 'Article')
    prev.value = null; next.value = null
    loadAdjacent(slug)
    if (article.value?.id) loadComments(article.value.id)
    // Lazy load images after content renders
    setTimeout(() => {
      const imgs = document.querySelectorAll('.content img')
      imgs.forEach(img => {
        img.classList.add('loaded')
      })
    }, 100)
  } catch(e){} finally { loading.value = false }
})

async function loadAdjacent(slug) {
  try { const r = await articleApi.getPrev(slug); prev.value = r.data } catch(e){}
  try { const r = await articleApi.getNext(slug); next.value = r.data } catch(e){}
}

function getArticleUrl(art) {
  if (!art || !art.publishedAt || !art.categorySlug) return '#'
  const d = new Date(art.publishedAt)
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  return '/article/' + art.categorySlug + '/' + y + '/' + m + '/' + art.slug
}

function formatUrl(url) {
  if (!url) return ''
  if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url
  return url
}

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.getFullYear() + '.' + String(dt.getMonth()+1).padStart(2,'0') + '.' + String(dt.getDate()).padStart(2,'0')
}

function formatDateTime(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.getFullYear() + '.' + String(dt.getMonth()+1).padStart(2,'0') + '.' + String(dt.getDate()).padStart(2,'0') + ' ' + String(dt.getHours()).padStart(2,'0') + ':' + String(dt.getMinutes()).padStart(2,'0')
}

function setReply(c) {
  replyTarget.value = c
  commentForm.value.parentId = c.id
  if (textareaRef.value) textareaRef.value.focus()
}
function cancelReply() {
  replyTarget.value = null
  commentForm.value.parentId = null
}

function onScroll() {
  const h = document.documentElement
  scrollPercent.value = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100
  // Save percentage on scroll (debounced)
  clearTimeout(window._scrollSaveTimer)
  window._scrollSaveTimer = setTimeout(() => {
    sessionStorage.setItem('article_scroll_pct_' + route.params.slug, scrollPercent.value)
  }, 500)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  // Restore scroll percentage from sessionStorage
  const savedPercent = sessionStorage.getItem('article_scroll_pct_' + route.params.slug)
  if (savedPercent) {
    setTimeout(() => {
      const h = document.documentElement
      const maxScroll = h.scrollHeight - h.clientHeight
      if (maxScroll > 0) {
        window.scrollTo(0, (parseFloat(savedPercent) / 100) * maxScroll)
      }
    }, 100)
  }
})

onUnmounted(() => {
  const h = document.documentElement
  const maxScroll = h.scrollHeight - h.clientHeight
  if (maxScroll > 0) {
    sessionStorage.setItem('article_scroll_pct_' + route.params.slug, (h.scrollTop / maxScroll) * 100)
  }
})

async function submitComment() {
  if (!commentForm.value.authorName.trim()) return showToast('请输入昵称', 'warning')
  if (!commentForm.value.authorEmail.trim()) return showToast('请输入邮箱', 'warning')
  if (!commentForm.value.content.trim()) return showToast('请输入评论内容', 'warning')
  submitting.value = true
  try {
    await commentApi.create({
      articleId: article.value.id,
      authorName: commentForm.value.authorName.trim(),
      authorEmail: commentForm.value.authorEmail.trim(),
      authorUrl: commentForm.value.authorUrl.trim() || null,
      content: commentForm.value.content.trim(),
      parentId: commentForm.value.parentId,
    })
    showToast('评论已发表', 'success')
    commentForm.value.content = ''
    commentForm.value.authorEmail = ''
    replyTarget.value = null
    commentForm.value.parentId = null
    if (article.value?.id) loadComments(article.value.id)
  } catch (e) { showToast('提交失败', 'error') }
  finally { submitting.value = false }
}
</script>

<style scoped>
.container { max-width: 720px; margin: 0 auto; padding: 80px 20px 40px; }
.article-detail h1 { font-size: 28px; font-weight: 400; color: #333; margin-bottom: 8px; }
.meta { font-size: 14px; color: #999; margin-bottom: 32px; }
.meta a { color: #4a7aaa; text-decoration: none; }
.content { font-size: 16px; line-height: 1.8; color: #333; word-break: break-word; }
.content :deep(h1) { font-size: 24px; margin: 32px 0 16px; }
.content :deep(h2) { font-size: 20px; margin: 28px 0 12px; }
.content :deep(h3) { font-size: 18px; margin: 24px 0 10px; }
.content :deep(p) { margin: 12px 0; }
.content :deep(code) { background: #f5f2f0; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
.content :deep(pre) { background: #f5f2f0; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 16px 0; }
.content :deep(pre code) { background: none; padding: 0; }
.content :deep(img) { max-width: 100%; border-radius: 4px; margin: 16px 0; display: block; }
.content :deep(blockquote) { border-left: 3px solid #e6e2dc; padding-left: 16px; color: #666; margin: 16px 0; }
.content :deep(ul), .content :deep(ol) { padding-left: 24px; margin: 12px 0; }
.content :deep(a) { color: #4a7aaa; text-decoration: none; }
.content :deep(a:hover) { text-decoration: underline; }
.content :deep(table) { border-collapse: collapse; width: 100%; margin: 16px 0; }
.content :deep(th), .content :deep(td) { border: 1px solid #e6e2dc; padding: 8px 12px; text-align: left; }
.content :deep(th) { background: #faf8f4; }

.prev-next { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 24px; border-top: 1px solid #eee; font-size: 14px; }
.prev-next .prev, .prev-next .next { max-width: 48%; }
.prev-next a { color: #5566cc; }
.empty-nav { visibility: hidden; }

.comments-section { margin-top: 60px; padding-top: 32px; border-top: 2px solid #e6e2dc; }
.comments-title { font-size: 18px; font-weight: 400; color: #4a4a4a; margin-bottom: 28px; }

.comment-form { margin-bottom: 36px; padding: 20px; background: #faf8f4; border: 1px solid #e6e2dc; border-radius: 4px; }
.form-row { display: flex; gap: 12px; margin-bottom: 12px; }
.form-input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px; font-family: inherit; background: #fff; outline: none; }
.form-input:focus { border-color: #4a7aaa; }
.form-input-url { flex: 1.5; }
.form-textarea { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px; font-family: inherit; background: #fff; outline: none; resize: vertical; line-height: 1.6; }
.form-textarea:focus { border-color: #4a7aaa; }
.form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.reply-hint { font-size: 13px; color: #8a8a8a; }
.cancel-reply { background: none; border: none; color: #c75450; cursor: pointer; font-size: 13px; margin-left: 8px; font-family: inherit; }
.submit-btn { padding: 7px 20px; background: #333; color: #fff; border: none; border-radius: 3px; font-size: 13px; cursor: pointer; font-family: inherit; }
.submit-btn:hover { background: #555; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.no-comments { color: #b0b0b0; font-size: 14px; padding: 20px 0; }

.comment-item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f0ece6; }

.comment-main { flex: 1; min-width: 0; }
.comment-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.comment-author { font-size: 14px; font-weight: 700; color: #333; text-decoration: none; }
.comment-author:hover { color: #4a7aaa; }
.comment-name { font-size: 14px; font-weight: 700; color: #333; }
.author-badge { font-size: 11px; background: #4a7aaa; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 400; }
.comment-date { font-size: 12px; color: #b0b0b0; }
.comment-quote { margin: 4px 0 8px; padding: 8px 12px; border-left: 3px solid #ddd; background: #f9f7f3; border-radius: 2px; font-size: 13px; color: #888; }
.comment-quote .quote-author { font-weight: 600; color: #666; margin-bottom: 2px; font-size: 12px; }
.comment-quote .quote-text { font-size: 12px; line-height: 1.5; max-height: 3em; overflow: hidden; text-overflow: ellipsis; }
.comment-body { font-size: var(--fs-sm); line-height: 1.8; color: var(--text); font-family: var(--font-ui); }
.comment-body :deep(p) { margin: 0.4em 0; }
.comment-body :deep(code) { background: #f3f0eb; padding: 1px 4px; border-radius: 2px; font-size: 0.9em; }
.reply-btn { background: none; border: none; color: var(--text-tertiary); font-size: var(--fs-xs); font-family: var(--font-ui); cursor: pointer; padding: 4px 8px; margin-top: 4px; border-radius: var(--radius-sm); transition: all .15s; min-height: 32px; }
.reply-btn:hover { color: var(--accent); background: var(--accent-light); }
.reply-btn:hover { color: #4a7aaa; }
</style>
