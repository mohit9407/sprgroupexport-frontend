import api from '@/lib/axios'

async function createGold(goldData) {
  return await api.post('gold/create', goldData)
}

async function getAllGold() {
  return await api.get('gold/get-gold-price')
}

async function getGoldById(id) {
  return await api.get('gold/getGoldById/' + id)
}

async function updateGold(id, goldData) {
  return await api.put('gold/update/' + id, goldData)
}

async function deleteGold(id) {
  return await api.delete('gold/delete/' + id)
}

export const goldService = {
  createGold,
  getAllGold,
  getGoldById,
  updateGold,
  deleteGold,
}
