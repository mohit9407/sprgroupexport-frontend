import api from '@/lib/axios'

async function applyInventory(payload) {
  const res = await api.post('inventory/apply', payload)
  return res.data
}

export const inventoryService = {
  applyInventory,
}
