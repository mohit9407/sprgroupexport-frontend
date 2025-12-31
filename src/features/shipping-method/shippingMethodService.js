import api from '@/lib/axios'

const BASE_PATH = '/shipping'

// Get all shipping methods
export const getShippingMethods = async () => {
  try {
    return await api.get(`${BASE_PATH}/get-all`)
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    throw error
  }
}

// Get shipping method by ID
export const getShippingMethodById = async (id) => {
  try {
    return await api.get(`${BASE_PATH}/get/${id}`)
  } catch (error) {
    console.error(`Error fetching shipping method ${id}:`, error)
    throw error
  }
}
