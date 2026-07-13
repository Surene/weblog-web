import api from './index.js'

export const articleApi = {
  getList(params) {
    return api.get('/articles', { params })
  },
  getBySlug(slug) {
    return api.get(`/articles/${slug}`)
  },
  getArchive(year, month) {
    return api.get('/articles/archive', { params: { year, month } })
  },
  getPrev(slug) {
    return api.get(`/articles/${slug}/prev`)
  },
  getNext(slug) {
    return api.get(`/articles/${slug}/next`)
  },
}
