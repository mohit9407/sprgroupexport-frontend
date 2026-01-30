import { api } from '@/lib/axios'

// Get all payment methods
const getAllPaymentMethods = async () => {
  try {
    const response = await api.get('/payments/get-all-methods')

    return response.data
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    console.error('Error response:', error.response?.data)
    throw new Error(
      error.response?.data?.message || 'Failed to fetch payment methods',
    )
  }
}

// Get active payment methods
const getActivePaymentMethods = async () => {
  try {
    const response = await api.get('/payments/active-methods')
    return response.data
  } catch (error) {
    console.error('Error fetching active payment methods:', error)
    throw new Error(
      error.response?.data?.message || 'Failed to fetch active payment methods',
    )
  }
}

export const paymentService = {
  getAllPaymentMethods,
  getActivePaymentMethods,
}
