'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaEdit, FaPlus } from 'react-icons/fa'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanStackTable'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPaymentMethods,
  updatePaymentMethod,
} from '@/features/paymentMethod/paymentMethodSlice'
import { toast } from 'react-hot-toast'

const PaymentMethodsPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const {
    items: paymentMethods,
    loading,
    error,
  } = useSelector((state) => state.paymentMethods)

  useEffect(() => {
    dispatch(fetchPaymentMethods())
  }, [dispatch])

  const handleStatusChange = async (id, isActive) => {
    try {
      await dispatch(
        updatePaymentMethod({
          id,
          methodData: { isActive },
        }),
      ).unwrap()
      dispatch(fetchPaymentMethods())
      toast.success('Payment method updated successfully')
    } catch (error) {
      toast.error(error || 'Failed to update payment method')
    }
  }

  const columns = [
    {
      id: 'isActive',
      header: 'Active',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.isActive}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          onChange={(e) => {
            handleStatusChange(row.original._id, e.target.checked)
          }}
        />
      ),
      size: 100,
    },
    {
      accessorKey: 'name',
      header: 'Payment Methods',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex">
          <button
            onClick={() => {
              const query = new URLSearchParams({
                data: JSON.stringify(row.original),
              }).toString()
              router.push(
                `/admin/payment-methods/edit/${row.original.id}?${query}`,
              )
            }}
            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
            title="Edit payment method"
          >
            <FaEdit className="w-4 h-4" />
          </button>
        </div>
      ),
      size: 100,
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">List Of All Payment Methods</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TanstackTable
          columns={columns}
          data={paymentMethods || []}
          isLoading={loading}
          mode="client"
        />
      </div>
    </div>
  )
}

export default PaymentMethodsPage
