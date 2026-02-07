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

// Fetch all products with advanced filters
export const fetchAllProductsWithFilters = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      filterBy,
      search,
      sortBy,
      sortOrder = 'asc',
      onlyLiked = false,
    } = filters

    const params = new URLSearchParams()

    params.append('page', page)
    params.append('limit', limit)
    if (filterBy) params.append('filterBy', filterBy)
    if (search) params.append('search', search)
    if (sortBy) params.append('sortBy', sortBy)
    if (sortOrder) params.append('sortOrder', sortOrder)
    if (onlyLiked) params.append('onlyLiked', onlyLiked)

    const response = await api.get(
      `/product/get-all-products-with-filters?${params.toString()}`,
    )
    return response
  } catch (error) {
    console.error('Error fetching products with filters:', error)
    throw error // Re-throw to be caught by the thunk
  }
}

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/product/create', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

// Update an existing product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(
      `/product/update/${productId}`,
      productData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Delete a product by ID
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/product/delete/${productId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

const productService = {
  fetchAllProducts,
  fetchAllProductsWithFilters,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}

export default productService
