import { api } from '@/lib/axios'

// Add item to cart
const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post(`/product/${productId}/addToCart`, {
      quantity,
    })
    return response.data
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw new Error(
      error.response?.data?.message || 'Failed to add item to cart',
    )
  }
}

// Remove item from cart
const removeFromCart = async (productId) => {
  try {
    const response = await api.post(`/product/${productId}/removeToCart`)
    return response.data
  } catch (error) {
    console.error('Error removing from cart:', error)
    throw new Error(
      error.response?.data?.message || 'Failed to remove item from cart',
    )
  }
}

// Remove all items from cart
const removeAllFromCart = async () => {
  try {
    const response = await api.delete('/product/removedAllToCart')
    return response.data
  } catch (error) {
    console.error('Error removing all items from cart:', error)
    throw new Error(
      error.response?.data?.message || 'Failed to remove all items from cart',
    )
  }
}

// Get cart items
const getCart = async () => {
  try {
    const response = await api.get('/cart')
    return response.data
  } catch (error) {
    console.error('Error fetching cart:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch cart')
  }
}

export const cartService = {
  addToCart,
  removeFromCart,
  getCart,
  removeAllFromCart,
}
