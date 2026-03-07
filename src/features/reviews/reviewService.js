import api from '@/lib/axios'

async function getAllReviews(params) {
  return await api.get('/product/get-all-reviews', {
    params,
  })
}

const addReview = async (productId, reviewData) => {
  return await api.post(`/product/reviews/${productId}`, reviewData)
}

const deleteReview = async (productId, reviewId) => {
  return await api.delete(`/product/${productId}/deleteReview/${reviewId}`)
}

export const reviewService = {
  getAllReviews,
  addReview,
  deleteReview,
}
