'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addReview } from '@/features/reviews/reviewsSlice'
import { FaStar } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ReviewForm = ({ productId, onReviewAdded, onClose }) => {
  const dispatch = useDispatch()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (!comment.trim()) {
      toast.error('Please write a review')
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData = {
        rating,
        comment: comment.trim(),
      }

      await dispatch(addReview({ productId, reviewData })).unwrap()
      toast.success('Review added successfully!')

      // Reset form
      setRating(0)
      setComment('')

      // Callback to refresh reviews
      if (onReviewAdded) {
        onReviewAdded()
      }

      if (onClose) {
        onClose()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="text-2xl transition-colors"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <FaStar
              className={
                star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              }
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating />
          {rating > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review *
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BA8B4E] focus:border-transparent"
            placeholder="Share your experience with this product..."
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#BA8B4E] text-white rounded-md hover:bg-[#8B6B3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
