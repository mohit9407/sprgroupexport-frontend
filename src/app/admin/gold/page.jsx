'use client'

import { TanstackTable } from '@/components/admin/TanStackTable'
import { fetchGold, deleteGold } from '@/features/gold/goldSlice'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useEffect, useState, Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { useRouter } from 'next/navigation'

const columnHelper = createColumnHelper()

function GoldTableContent() {
  const dispatch = useDispatch()
  const router = useRouter()
  const goldState = useSelector((state) => state?.gold || {})
  const { data, isLoading, error } = goldState?.allGold || {
    data: [],
    isLoading: false,
    error: null,
  }

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    gold: null,
  })

  useEffect(() => {
    dispatch(fetchGold())
  }, [dispatch])

  const columns = useMemo(
    () => [
      columnHelper.accessor('_id', {
        header: 'ID',
        enableSorting: false,
      }),
      columnHelper.accessor('carat', {
        header: 'Carat',
        enableSorting: false,
      }),
      columnHelper.accessor('pricePerGram', {
        header: 'Price Per Gram',
        enableSorting: false,
        cell: (info) => (
          <p className="max-w-md text-sm text-gray-700 line-clamp-3">
            {info.getValue()}
          </p>
        ),
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
    [router],
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

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">List Of All Gold Data</h1>
        <button
          onClick={() => router.push('/admin/gold/add')}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Gold Data
        </button>
      </div>

      <TanstackTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
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

export default function Golpage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <GoldTableContent />
    </Suspense>
  )
}
