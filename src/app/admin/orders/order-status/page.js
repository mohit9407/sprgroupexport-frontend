'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanstackTable'
import { useRouter } from 'next/navigation'
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOrderStatuses,
  deleteOrderStatus,
  updateOrderStatus,
} from '@/features/orderStatus/orderStatusSlice'
import { toast } from '@/utils/toastConfig'

const columnHelper = createColumnHelper()

const OrderStatusTable = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  // Get order statuses from Redux store
  const { statuses, loading, error } = useSelector((state) => state.orderStatus)

  // Fetch order statuses on component mount
  useEffect(() => {
    dispatch(fetchOrderStatuses())
  }, [dispatch])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this status?')) {
      try {
        await dispatch(deleteOrderStatus(id)).unwrap()
        toast.success('Status deleted successfully')
      } catch (error) {
        toast.error(error.message || 'Failed to delete status')
      }
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await dispatch(
        updateOrderStatus({ id, data: { isDefault: true } }),
      ).unwrap()
      dispatch(fetchOrderStatuses())
      toast.success('Default status updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update default status')
    }
  }

  const columns = [
    columnHelper.accessor('_id', {
      header: 'ID',
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor('orderStatus', {
      header: 'Order Status',
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor('isDefault', {
      header: 'Default',
      cell: (info) =>
        info.getValue() ? (
          <span className="text-green-600">
            <FaCheck className="inline mr-1" /> Yes
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSetDefault(info.row.original._id)
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Set Default
          </button>
        ),
      enableSorting: false,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const params = new URLSearchParams({
                statusName: row.original.orderStatus,
                isDefault: row.original.isDefault,
              }).toString()
              router.push(
                `/admin/orders/order-status/edit/${row.original._id}?${params}`,
              )
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full hover:text-blue-700 transition-colors"
            title="Edit Status"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original._id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
            title="Delete Status"
            disabled={row.original.isDefault}
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
      enableSorting: false,
    }),
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">List Of All Order Status</h1>
        <button
          onClick={() => router.push('/admin/orders/order-status/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FaPlus className="mr-2" /> Add Order Status
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TanstackTable
          columns={columns}
          data={statuses || []}
          isLoading={loading}
          mode="client"
        />
      </div>
    </div>
  )
}

export default OrderStatusTable
