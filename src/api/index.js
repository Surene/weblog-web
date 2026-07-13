import axios from 'axios'

const api = axios.create({
  baseURL: '/api/public',
  timeout: 15000,
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || err.message || 'request failed'
    console.error('[API]', msg)
    return Promise.reject(new Error(msg))
  }
)

export default api
