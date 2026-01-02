import api from '@/lib/axios'

export async function getAllUsers(params) {
  return await api.get('/auth/get-all-users', {
    params,
  })
}

export const getCustomer = async (id) => {
  if (!id) return
  return await api.get(`/auth/get-user/${id}`)
}

export const addNewCustomer = async (payload) => {
  return await api.post('/auth/signup', payload)
}

export const updateCustomer = async (id, payload) => {
  return await api.put('/auth/edit-profile', payload)
}
