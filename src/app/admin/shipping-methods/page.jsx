'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { FaEdit } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchShippingMethods,
  deleteShippingMethods,
} from '@/features/shipping-method/shippingMethodSlice'
import { toast } from '@/utils/toastConfig'
import { TanstackTable } from '@/components/admin/TanStackTable'
import ConfirmationModal from '@/components/admin/ConfirmationModal'

const columnHelper = createColumnHelper()

const ShippingMethodsTableContent = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const { methods, loading, error } = useSelector((state) => state.shipping)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMethodId, setSelectedMethodId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    dispatch(fetchShippingMethods())
  }, [dispatch])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMethodId) return

    setIsDeleting(true)
    try {
      await dispatch(deleteShippingMethods(selectedMethodId)).unwrap()
      toast.success('Shipping method deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error(error?.message || 'Failed to delete shipping method')
    } finally {
      setIsDeleting(false)
      setSelectedMethodId(null)
    }
  }, [selectedMethodId, dispatch])

  const columns = [
    columnHelper.accessor('name', {
      header: 'Shipping Title',
      enableSorting: true,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      enableSorting: true,
      cell: (info) => `$ ${info.getValue()}`,
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      enableSorting: true,
      cell: (info) => {
        const isActive = info.getValue() === 'active'
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center  justify-center">
          <button
            onClick={() => {
              console.log('ROW ORIGINAL', row.original)
              const params = new URLSearchParams({
                name: row.original.name,
                isDefault: row.original.isDefault,
              }).toString()

              router.push(`/admin/shipping-methods/edit/${row.original._id}`)
              console.log('origin id', row.original._id)
            }}
            className="text-blue-600 hover:bg-blue-50 rounded-full"
            title="Edit Shipping Method"
          >
            <FaEdit className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Shipping Methods</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TanstackTable
          columns={columns}
          data={methods || []}
          isLoading={loading}
          mode="client"
        />
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedMethodId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Shipping Method"
        description="Are you sure you want to delete this shipping method? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        theme="error"
        isLoading={isDeleting}
      />
    </div>
  )
}

function ShippingMethodsTable() {
  return (
    <Suspense
      fallback={
        <div className="p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      }
    >
      <ShippingMethodsTableContent />
    </Suspense>
  )
}

export default ShippingMethodsTable
