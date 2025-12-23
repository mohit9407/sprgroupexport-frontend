import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.data)
      return Promise.reject(error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
      return Promise.reject({ message: 'No response from server' })
    } else {
      console.error('Request error:', error.message)
      return Promise.reject({ message: error.message })
    }
  },
)

export default api
