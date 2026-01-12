import api from '@/lib/axios'

async function getAllUsers(params) {
  return await api.get('/auth/get-all-users', {
    params,
  })
}

const getCustomer = async (id) => {
  if (!id) return
  return await api.get(`/auth/get-user/${id}`)
}

const addNewCustomer = async (payload) => {
  return await api.post('/auth/signup', payload)
}

const updateCustomer = async (id, payload) => {
  if (!id) return
  return await api.put('/auth/edit-profile', payload)
}

const getCustomerAddress = async (userId) => {
  const response = await api.get(
    `/auth/admin/user/${userId}/shipping-addresses`,
  )
  return response
}

const addCustomerAddress = async (userId, data) => {
  const response = await api.post(
    `/auth/admin/user/${userId}/add-shipping-address`,
    data,
  )
  return response
}

const updateCustomerAddress = async (userId, addressId, data) => {
  const response = await api.put(
    `/auth/admin/user/${userId}/shipping-addresses/${addressId}`,
    data,
  )
  return response
}

const deleteCustomerAddress = async (addressId, data) => {
  const response = await api.delete(`/auth/delete/${addressId}`, data)
  return response
}

export const customerAddressService = {
  getAllUsers,
  getCustomer,
  addNewCustomer,
  updateCustomer,
  getCustomerAddress,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
}
