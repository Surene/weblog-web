import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/blog', name: 'blog', component: () => import('../views/Archive.vue') },
  { path: '/archives', name: 'archives', component: () => import('../views/Archive.vue') },
  { path: '/article/:category/:year/:month/:slug', name: 'article', component: () => import('../views/ArticleDetail.vue'), meta: { hideHeader: true } },
  { path: '/category/:slug', name: 'category', component: () => import('../views/CategoryPage.vue') },
  { path: '/search', name: 'search', component: () => import('../views/Search.vue') },
  { path: '/about', name: 'about', component: () => import('../views/About.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) { return to.hash ? { el: to.hash } : { top: 0 } },
})

export default router
