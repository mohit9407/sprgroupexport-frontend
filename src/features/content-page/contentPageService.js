import api from '@/lib/axios'

async function createContentPage(payload) {
  return api.post('/content-pages/create', payload)
}

async function getAllContentPage(params) {
  return api.get('/content-pages/get-all', { params })
}

async function getContentPageById(id) {
  return api.get(`/content-pages/${id}`)
}

async function updateContentPage(id, payload) {
  return api.put(`/content-pages/update/${id}`, payload)
}

async function deleteContentPage(id) {
  return api.delete(`/content-pages/delete/${id}`)
}

const contentPageService = {
  createContentPage,
  getAllContentPage,
  getContentPageById,
  updateContentPage,
  deleteContentPage,
}

export default contentPageService
