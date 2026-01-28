'use client'

import { useEffect, useMemo, Suspense, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createColumnHelper } from '@tanstack/react-table'
import { FaEdit, FaTrash } from 'react-icons/fa'
import {
  fetchAllCategories,
  selectAllCategories,
  deleteCategory,
} from '@/features/categories/categoriesSlice'
import { useRouter } from 'next/navigation'
import { TanstackTable } from '@/components/admin/TanStackTable'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { useTableQueryParams } from '@/components/admin/TanStackTable'
import { toast } from '@/utils/toastConfig'

const columnHelper = createColumnHelper()

const getColumns = (router, handleDeleteClick) => [
  columnHelper.accessor('_id', {
    header: 'ID',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
    cell: (info) => {
      const { name, parentName } = info.row.original
      return parentName ? `${name} / ${parentName}` : name
    },
  }),
  columnHelper.accessor('image', {
    header: 'Image',
    enableSorting: false,
    cell: (info) => {
      const value = info.getValue()
      const name = info.row.original.name
      return (
        <div className="w-20 h-20 bg-gray-100 grid place-items-center overflow-hidden">
          {value ? (
            <img
              src={value}
              alt={name}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 text-sm">No Image</span>
          )}
        </div>
      )
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Added/Last Modified',
    enableSorting: true,
    cell: (info) => {
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }

      return (
        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium">Added:</span>{' '}
            {formatDate(info.getValue())}
          </div>
          <div>
            <span className="font-medium">Updated:</span>{' '}
            {formatDate(info.row.original.updatedAt)}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    enableSorting: true,
    cell: (info) => {
      const isActive = info.getValue() === 'active'
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
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
          onClick={() =>
            router.push(`/admin/categories/edit/${row.original._id}`)
          }
          title="Edit"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
          onClick={() => handleDeleteClick(row.original)}
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    ),
  }),
]

function CategoriesDisplayContent() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    category: null,
  })

  const handleDeleteClick = (category) => {
    setDeleteModal({ open: true, category })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.category) return
    try {
      await dispatch(deleteCategory(deleteModal.category._id)).unwrap()
      toast.success('Category deleted successfully')
      setDeleteModal({ open: false, category: null })
    } catch (err) {
      toast.error(err?.message || 'Failed to delete category')
    }
  }

  const {
    data: categoriesData,
    pagination: apiPagination,
    isLoading,
    error,
  } = useSelector(selectAllCategories)

  // Process categories to include parent names
  const categories = useMemo(() => {
    return (
      categoriesData?.map((category) => {
        if (!category.parent) return { ...category, parentName: '' }

        const parent = categoriesData.find((cat) => cat._id === category.parent)
        return {
          ...category,
          parentName: parent?.name || '',
        }
      }) || []
    )
  }, [categoriesData])

  const columns = useMemo(() => getColumns(router, handleDeleteClick), [router])

  useEffect(() => {
    dispatch(
      fetchAllCategories({
        search: params?.search || undefined,
        sortBy: params?.sortBy,
        direction: params?.sortBy ? params.direction : undefined,
        page: params?.pageIndex + 1,
        limit: params?.pageSize || undefined,
        filterBy: params?.filterBy || undefined,
      }),
    )
  }, [dispatch, params])

  const filterByOptions = useMemo(
    () => [
      { label: 'Name', value: 'name' },
      {
        label: 'Status',
        value: 'status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    ],
    [],
  )

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <TanstackTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        mode="server"
        pageCount={apiPagination?.totalPages}
        filterByOptions={filterByOptions}
        actions={
          <button
            className="bg-sky-600 text-white px-4 py-2 rounded text-sm hover:bg-sky-700 transition-colors"
            onClick={() => router.push('/admin/categories/add')}
          >
            Add New Category
          </button>
        }
      />

      <ConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, category: null })}
        onConfirm={handleConfirmDelete}
        title="Delete category"
        description="Are you sure you want to delete this category?"
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}

export default function CategoriesDisplayPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      }
    >
      <CategoriesDisplayContent />
    </Suspense>
  )
}
