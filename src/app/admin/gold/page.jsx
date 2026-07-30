'use client'

import { TanstackTable } from '@/components/admin/TanStackTable'
import {
  fetchGold,
  deleteGold,
  refreshGoldPrices,
} from '@/features/gold/goldSlice'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useEffect, useState, Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaEdit, FaPlus, FaTrash, FaSync } from 'react-icons/fa'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { useRouter } from 'next/navigation'

const columnHelper = createColumnHelper()

const formatPricePerGram = (value, currency = 'USD') => {
  const amount = Number(value)
  if (Number.isNaN(amount)) return '—'
  try {
    return `${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}/g`
  } catch {
    return `${currency} ${amount.toFixed(2)}/g`
  }
}

function GoldTableContent() {
  const dispatch = useDispatch()
  const router = useRouter()
  const goldState = useSelector((state) => state?.gold || {})
  const { data, currency, isLoading, error } = goldState?.allGold || {
    data: [],
    currency: 'USD',
    isLoading: false,
    error: null,
  }
  const isRefreshing = goldState?.refreshGold?.isLoading

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    gold: null,
  })

  useEffect(() => {
    dispatch(fetchGold())
  }, [dispatch])

  const columns = useMemo(
    () => [
      columnHelper.accessor('carat', {
        header: 'Carat',
        enableSorting: false,
        cell: (info) => {
          const carat = info.getValue()
          return carat != null ? `${carat}K` : '—'
        },
      }),
      columnHelper.accessor('pricePerGram', {
        header: `Price Per Gram (${currency || 'USD'})`,
        enableSorting: false,
        cell: (info) => (
          <p className="max-w-md text-sm text-gray-700">
            {formatPricePerGram(info.getValue(), currency || 'USD')}
          </p>
        ),
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Last Updated',
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue()
          if (!value) return '—'
          return new Date(value).toLocaleString('en-US')
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-center">
            <button
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full hover:text-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/admin/gold/edit/${row.original._id}`)
              }}
              title="Edit Gold"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteModal({
                  open: true,
                  gold: row.original,
                })
              }}
              title="Delete Gold"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    [router, currency],
  )

  const handleConfirmDelete = async () => {
    if (!deleteModal.gold) return

    try {
      await dispatch(deleteGold(deleteModal.gold._id)).unwrap()
      toast.success('Gold deleted successfully')
      setDeleteModal({ open: false, gold: null })
      dispatch(fetchGold())
    } catch (err) {
      toast.error(err || 'Failed to delete gold')
    }
  }

  const handleRefreshPrices = async () => {
    try {
      await dispatch(refreshGoldPrices()).unwrap()
      toast.success('Gold prices refreshed from GoldAPI')
    } catch (err) {
      toast.error(err || 'Failed to refresh gold prices')
    }
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">List Of All Gold Data</h1>
          <p className="text-sm text-gray-500 mt-1">
            GoldAPI rates including 18% GST and 1% charge
            {currency ? ` · ${currency}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshPrices}
            disabled={isRefreshing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
          </button>
          <button
            onClick={() => router.push('/admin/gold/add')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Gold Data
          </button>
        </div>
      </div>

      <TanstackTable
        columns={columns}
        data={Array.isArray(data) ? data : []}
        isLoading={isLoading || isRefreshing}
        mode="server"
      />

      <ConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, gold: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Gold Data"
        description="Are you sure you want to delete this gold data?"
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}

export default function Goldpage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <GoldTableContent />
    </Suspense>
  )
}
