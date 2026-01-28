'use client'

import { useEffect, useMemo, useCallback, useState, Suspense } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { FaTrash } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReviews, deleteReview } from '@/features/reviews/reviewsSlice'
import toast from 'react-hot-toast'
import {
  TanstackTable,
  useTableQueryParams,
} from '@/components/admin/TanStackTable'
import ConfirmationModal from '@/components/admin/ConfirmationModal'

const columnHelper = createColumnHelper()

function ReviewsTableContent() {
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    review: null,
  })

  const {
    data,
    pagination: apiPagination,
    isLoading,
    message: error,
  } = useSelector((state) => state.reviews.allReviews)

  const getReviews = useCallback(() => {
    dispatch(
      fetchReviews({
        search: params?.search ?? undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortBy ? params.direction : undefined,
        page: params?.pageIndex + 1,
        limit: params?.pageSize ?? 10,
        filterBy: params?.filterBy || undefined,
      }),
    )
  }, [dispatch, params])

  useEffect(() => {
    getReviews()
  }, [getReviews])

  const handleDeleteClick = (review) => {
    setDeleteModal({ open: true, review })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.review) return

    try {
      await dispatch(
        deleteReview({
          productId: deleteModal.review.productId,
          reviewId: deleteModal.review._id,
        }),
      ).unwrap()

      toast.success('Review deleted successfully')
      setDeleteModal({ open: false, review: null })
      getReviews()
    } catch (err) {
      toast.error(err || 'Failed to delete review')
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('_id', {
        header: 'ID',
        enableSorting: false,
      }),
      columnHelper.accessor('productName', {
        header: 'Product Name',
        enableSorting: true,
      }),
      columnHelper.accessor('comment', {
        header: 'Review Text',
        enableSorting: true,
        cell: (info) => (
          <p className="max-w-md text-sm text-gray-700 line-clamp-3">
            {info.getValue()}
          </p>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        enableSorting: true,
        cell: (info) => (
          <div className="text-sm">
            <div className="font-medium">
              {new Date(info.getValue()).toLocaleDateString()}
            </div>
            <div className="text-gray-500">
              {new Date(info.getValue()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            onClick={() => handleDeleteClick(row.original)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [],
  )

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">List of Reviews</h2>
      <TanstackTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        mode="server"
        pageCount={apiPagination?.totalPages}
      />

      <ConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, review: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review?"
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ReviewsTableContent />
    </Suspense>
  )
}
