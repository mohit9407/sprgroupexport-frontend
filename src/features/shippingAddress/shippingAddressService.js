import api from '@/lib/axios'
import { getAuthToken } from '../user/userService'

// Add shipping address
export const addShippingAddress = async (addressData) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  try {
    const response = await api.post('/auth/shipping-address', {
      fullName: addressData.name,
      address: addressData.address,
      country: 'India',
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.pinCode,
      mobileNo: addressData.mobile,
    })
    return response
  } catch (error) {
    throw error.response?.data?.message || 'Failed to add shipping address'
  }
}

// Get user's shipping addresses
export const getShippingAddresses = async () => {
  try {
    const response = await api.get('/auth/get-all-address')
    // Ensure we're returning the data in the expected format
    return {
      data: Array.isArray(response) ? response : response?.data || [],
    }
  } catch (error) {
    console.error('Error fetching shipping addresses:', error)
    const errorMessage =
      error.response?.data?.message || 'Failed to fetch shipping addresses'
    throw new Error(errorMessage)
  }
}

// Set default shipping address
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.post(
      `/auth/shipping-address/set-default/${addressId}`,
    )
    return response
  } catch (error) {
    console.error('Error setting default address:', error)
    throw error.response?.data?.message || 'Failed to set default address'
  }
}

// Update shipping address
export const updateShippingAddress = async ({ id, ...addressData }) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  try {
    const response = await api.put(`/auth/update/${id}`, {
      fullName: addressData.name,
      address: addressData.address,
      country: 'India',
      city: addressData.city,
      state: addressData.state,
      zip: addressData.pinCode,
      mobileNo: addressData.mobile,
    })
    return response
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update shipping address'
  }
}

// Delete shipping address
export const deleteShippingAddress = async (addressId) => {
  try {
    const response = await api.delete(`/auth/delete/${addressId}`)
    return response
  } catch (error) {
    console.error('Error deleting address:', error)
    throw error.response?.data?.message || 'Failed to delete address'
  }
}

const shippingAddressService = {
  addShippingAddress,
  getShippingAddresses,
  setDefaultAddress,
  updateShippingAddress,
  deleteShippingAddress,
}

export default shippingAddressService
