'use client'

import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { TanstackTable } from '@/components/admin/TanStackTable'
import { deleteSilver, fetchSilver } from '@/features/silver/silverSlice'
import { toast } from '@/utils/toastConfig'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'

const columnHelper = createColumnHelper()

function SilverTableContent() {
  const dispatch = useDispatch()
  const router = useRouter()
  const silverState = useSelector((state) => state?.silver || {})
  const { data, loadning, error } = silverState || {
    data: [],
    loadning: false,
    error: null,
  }

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    silver: null,
  })

  useEffect(() => {
    dispatch(fetchSilver())
  }, [dispatch])

  const columns = useMemo(
    () => [
      columnHelper.accessor('_id', {
        header: 'ID',
        enableSorting: false,
      }),
      columnHelper.accessor('purity', {
        header: 'Purity',
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
                router.push(`/admin/silver/edit/${row.original._id}`)
              }}
              title="Edit Silver"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteModal({
                  open: true,
                  silver: row.original,
                })
              }}
              title="Delete Silver"
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
    if (!deleteModal.silver) return

    try {
      await dispatch(deleteSilver(deleteModal.silver._id)).unwrap()
      toast.success('Silver deleted successfully')
      setDeleteModal({ open: false, silver: null })
      dispatch(fetchSilver())
    } catch (err) {
      toast.error(err || 'Failed to delete silver')
    }
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">List Of All Silver Data</h1>
        <button
          onClick={() => router.push('/admin/silver/add')}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Silver Data
        </button>
      </div>

      <TanstackTable
        columns={columns}
        data={data || []}
        isLoading={loadning}
        mode="server"
      />

      <ConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, silver: null })}
        onConfirm={handleConfirmDelete}
        title="Delete silver Data"
        description="Are you sure you want to delete this silver data?"
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}

export default function Silverpage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SilverTableContent />
    </Suspense>
  )
}
