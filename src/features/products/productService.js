import api from '@/lib/axios'

// Fetch all products with optional filters
export const fetchAllProducts = async (filters = {}) => {
  try {
    const {
      minPrice,
      maxPrice,
      categories,
      sortBy,
      page = 1,
      limit = 10,
      isFeatured,
      special,
      type,
      status,
    } = filters

    const params = new URLSearchParams()

    if (minPrice !== undefined) params.append('minPrice', minPrice)
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice)
    if (categories?.length) params.append('category', categories.join(','))
    if (sortBy) params.append('sort', sortBy)
    if (isFeatured !== undefined) params.append('isFeatured', isFeatured)
    if (special !== undefined) params.append('special', special)
    if (type) params.append('type', type)
    if (status) params.append('status', status)
    params.append('page', page)
    params.append('limit', limit)

    const response = await api.get(
      `/product/get-all-product?${params.toString()}`,
    )
    return response.data
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error // Re-throw to be caught by the thunk
  }
}

// Fetch single product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await api.get(`/product/${productId}`)

    // Handle different possible response structures
    if (response.data && response.data.data) {
      return response.data.data // If response is { data: { ...productData } }
    }
    if (response.data) {
      return response.data // If response is the product data directly
    }

    return response // Fallback to the entire response
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

const productService = {
  fetchAllProducts,
  fetchProductById,
}

export default productService
