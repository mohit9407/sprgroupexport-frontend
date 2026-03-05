import api from '@/lib/axios'

async function createSilver(silverData) {
  return await api.post('silver/create', silverData)
}

export const fetchSilverPrices = async () => {
  const response = await api.get('/silver/prices')
  return response
}

async function getAllSilver() {
  const response = await api.get('silver/get-silver-price')
  return response
}

async function getSilverById(id) {
  return await api.get('silver/getSilver/' + id)
}

async function updateSilver(id, silverData) {
  return await api.put('silver/update/' + id, silverData)
}

async function deleteSilver(id) {
  return await api.delete('silver/delete/' + id)
}

export const silverService = {
  createSilver,
  fetchSilverPrices,
  getAllSilver,
  getSilverById,
  updateSilver,
  deleteSilver,
}
