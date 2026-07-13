import api from './index.js'

export const categoryApi = {
  getAll() {
    return api.get('/categories')
  },
}
