'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanStackTable/TanstackTable'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  fetchAllAttributes,
  selectAllAttributes,
  selectAttributeStatus,
  deleteAttribute,
} from '@/features/attributes/attributesSlice'

const columnHelper = createColumnHelper()

const getColumns = (router, handleDeleteClick) => [
  columnHelper.accessor('name', {
    header: 'Attribute',
    enableSorting: true,
    cell: (info) => (
      <div className="font-medium capitalize">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor('values', {
    header: 'Values',
    enableSorting: false,
    cell: (info) => {
      const values = info.getValue() || []
      return (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={value._id || index}
              className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-700"
            >
              {value.value}
            </span>
          ))}
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 justify-center">
        <button
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full hover:text-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/admin/attributes/edit/${row.original._id}`)
          }}
          title="Edit attribute"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick(row.original)
          }}
          title="Delete attribute"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    ),
  }),
]

export default function AttributesPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const attributesData = useSelector(selectAllAttributes)
  const status = useSelector(selectAttributeStatus)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAttribute, setSelectedAttribute] = useState(null)

  useEffect(() => {
    dispatch(fetchAllAttributes())
  }, [dispatch])

  const attributes = useMemo(() => {
    return attributesData || []
  }, [attributesData])

  const handleDeleteClick = useCallback((attribute) => {
    setSelectedAttribute(attribute)
    setShowDeleteModal(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!selectedAttribute) return

    setDeletingId(selectedAttribute._id)
    try {
      await dispatch(deleteAttribute(selectedAttribute._id)).unwrap()
      toast.success('Attribute deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error(error || 'Failed to delete attribute')
    } finally {
      setDeletingId(null)
      setSelectedAttribute(null)
    }
  }

  // Get columns with router and state
  const columns = useMemo(
    () => getColumns(router, handleDeleteClick),
    [router, handleDeleteClick],
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Attributes</h1>

        <button
          className="bg-sky-600 text-white px-4 py-2 rounded text-sm hover:bg-sky-700 transition-colors"
          onClick={() => router.push('/admin/attributes/add')}
        >
          Add New Attribute
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={attributes}
          isLoading={status === 'loading'}
        />
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedAttribute(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Attribute"
        description="Are you sure you want to delete this attribute? This action cannot be undone."
        confirmText={deletingId ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        theme="error"
        isLoading={!!deletingId}
      />
    </div>
  )
}
