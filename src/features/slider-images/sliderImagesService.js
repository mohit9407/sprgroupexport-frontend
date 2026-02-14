import api from '@/lib/axios'

async function createSliderImages(params) {
  return await api.post('/slider-images/create', params)
}

async function fetchSliderImages() {
  return await api.get('/slider-images/get-all')
}

async function getByIdSliderImages(id) {
  return await api.get(`/slider-images/slider/${id}`)
}

async function updateSliderImages(id, params) {
  return api.put(`/slider-images/update/${id}`, params)
}

async function deleteSliderImages(id) {
  return await api.delete(`/slider-images/delete/${id}`)
}

export const sliderImagesService = {
  createSliderImages,
  fetchSliderImages,
  getByIdSliderImages,
  updateSliderImages,
  deleteSliderImages,
}
