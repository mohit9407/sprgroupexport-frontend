import api from '@/lib/axios'

async function getAllReviews(params) {
  return await api.get('/product/get-all-reviews', {
    params,
  })
}

const deleteReview = async (productId, reviewId) => {
  return await api.delete(`/product/${productId}/deleteReview/${reviewId}`)
}

export const reviewService = {
  getAllReviews,
  deleteReview,
}
