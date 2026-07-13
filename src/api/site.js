import api from './index.js'

export const siteApi = {
  getConfig() {
    return api.get('/site')
  },
}
