import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Get token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Order related API calls
export const placeOrder = async (orderData) => {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await api.post('/orders/create', orderData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })

    if (!response.data) {
      throw new Error('No data received from server')
    }

    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      throw new Error('Your session has expired. Please log in again.')
    }

    throw new Error(
      error.response?.data?.message ||
        'Failed to place order. Please try again.',
    )
  }
}

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch order details'
  }
}

export const getUserOrders = async () => {
  try {
    const response = await api.get('/orders/user/orders')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch orders'
  }
}

/**
 * Fetches a single order by ID
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise<Object>} The order details
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/user/${orderId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch order details'
  }
}
