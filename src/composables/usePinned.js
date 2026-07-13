import { inject, computed } from 'vue'

export function usePinned() {
  const siteConfig = inject('siteConfig', { value: {} })
  const pinnedId = computed(() => String(siteConfig.value?.top_article_id || ''))

  function isPinned(article) {
    return article && pinnedId.value && String(article.id) === pinnedId.value
  }

  function sortByPinned(articles) {
    if (!pinnedId.value || !articles || !articles.length) return articles
    return [...articles].sort((a, b) => {
      const aPinned = String(a.id) === pinnedId.value ? 1 : 0
      const bPinned = String(b.id) === pinnedId.value ? 1 : 0
      return bPinned - aPinned
    })
  }

  function sortByPinnedThenDate(articles) {
    if (!pinnedId.value || !articles || !articles.length) return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    return [...articles].sort((a, b) => {
      const aPinned = String(a.id) === pinnedId.value ? 1 : 0
      const bPinned = String(b.id) === pinnedId.value ? 1 : 0
      if (aPinned !== bPinned) return bPinned - aPinned
      return new Date(b.publishedAt) - new Date(a.publishedAt)
    })
  }

  return { pinnedId, isPinned, sortByPinned, sortByPinnedThenDate }
}
