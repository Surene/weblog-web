<template>
  <div>
    <header class="header" v-if="!hideHeader">
      <div class="header-inner">
        <div class="header-brand-group">
          <router-link to="/blog" class="header-brand"><img v-if="siteConfig.site_logo" :src="siteConfig.site_logo" class="header-logo" alt="logo" />{{ siteName }}</router-link>
          <span class="header-slogan">{{ siteConfig.site_description || '漫漫人生，人生漫漫' }}</span>
        </div>
        <div class="header-right">
          <div class="header-search">
            <svg class="header-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.35-4.35"/></svg>
            <input
              v-model="searchKeyword"
              placeholder="搜索..."
              class="header-search-input"
              @keyup.enter="doSearch"
            />
          </div>
        </div>
      </div>
    </header>
    <div v-if="siteConfig.notice_bar" class="notice-bar">
      <div class="notice-inner">
        <span class="notice-icon">网站公告：</span>
        <span :class="['notice-text', siteConfig.notice_bar && siteConfig.notice_bar.length > 30 ? 'long' : '']">{{ siteConfig.notice_bar }}</span>
      </div>
    </div>
    <main>
      <router-view :key="$route.fullPath" />
    </main>
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-social" v-if="hasSocial">
          <a v-if="siteConfig.social_github" :href="siteConfig.social_github" target="_blank" title="GitHub">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a v-if="siteConfig.social_twitter" :href="siteConfig.social_twitter" target="_blank" title="Twitter">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a v-if="siteConfig.social_douyin" :href="siteConfig.social_douyin" target="_blank" title="抖音">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.16 8.16 0 005.58 2.19V11.9a4.84 4.84 0 01-3.77-1.74V6.69h3.77z"/></svg>
          </a>
          <a v-if="siteConfig.social_bilibili" :href="siteConfig.social_bilibili" target="_blank" title="B站">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 01-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 01.16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>
          </a>
        </div>
        <p style="margin-top:6px">
          &copy; {{ new Date().getFullYear() }} {{ siteName }}
          <span v-if="siteConfig.github_url">&nbsp;&middot;&nbsp;<a :href="siteConfig.github_url" target="_blank">GitHub</a></span>
        </p>
        <p v-if="siteConfig.footer_text" style="margin-top:4px;font-size:13px;color:#888">{{ siteConfig.footer_text }}</p>
        <p v-if="siteConfig.icp_number" style="margin-top:4px;font-size:12px;color:#aaa">
          <a href="https://beian.miit.gov.cn/" target="_blank" style="color:#aaa;text-decoration:none">{{ siteConfig.icp_number }}</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { siteApi } from './api/site.js'

const siteConfig = ref({})
const siteName = ref('My Blog')
const searchKeyword = ref('')
const route = useRoute()
function doSearch() {
  if (!searchKeyword.value.trim()) return
  window.location.href = '/search?q=' + encodeURIComponent(searchKeyword.value)
}

const hideHeader = computed(() => route.meta?.hideHeader)
const hasSocial = computed(() => {
  return siteConfig.value.social_github || siteConfig.value.social_twitter || siteConfig.value.social_douyin || siteConfig.value.social_bilibili
})

onMounted(async () => {
  try {
    const r = await siteApi.getConfig()
    siteConfig.value = r.data || {}
    siteName.value = siteConfig.value.site_name || 'My Blog'
    document.title = siteName.value
    if (siteConfig.value.site_favicon) {
      let link = document.querySelector('link[rel=icon]')
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
      link.href = siteConfig.value.site_favicon
    }
    if (siteConfig.value.seo_description) {
      let meta = document.querySelector('meta[name=description]')
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
      meta.content = siteConfig.value.seo_description
    }
    if (siteConfig.value.seo_keywords) {
      let meta = document.querySelector('meta[name=keywords]')
      if (!meta) { meta = document.createElement('meta'); meta.name = 'keywords'; document.head.appendChild(meta) }
      meta.content = siteConfig.value.seo_keywords
    }
  } catch(e){}
})
</script>
