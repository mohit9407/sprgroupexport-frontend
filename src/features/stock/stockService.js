import api from '@/lib/axios'

export const fetchStockProducts = async ({
  page = 1,
  limit = 10,
  maxStock,
  sortBy,
} = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    maxStock,
  })

  if (sortBy) queryParams.append('sort', sortBy)

  const url = `/product/get-all-product?${queryParams.toString()}`

  const response = await api.get(url)

  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        total: response.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(response.length / limit),
      },
    }
  } else if (response && response.data && response.pagination) {
    return response
  } else {
    const dataArray = Array.isArray(response) ? response : []
    return {
      data: dataArray,
      pagination: {
        total: dataArray.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(dataArray.length / limit),
      },
    }
  }
}

export default {
  fetchStockProducts,
}
