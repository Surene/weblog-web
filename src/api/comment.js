import axios from 'axios'

const commentClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

commentClient.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || err.message || 'request failed'
    console.error('[API]', msg)
    return Promise.reject(new Error(msg))
  }
)

export const commentApi = {
  getByArticle(articleId) {
    return commentClient.get(`/comments/article/${articleId}`)
  },
  create(data) {
    return commentClient.post('/comments', data)
  },
}