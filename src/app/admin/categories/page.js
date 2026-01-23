'use client'

import { useEffect, useMemo, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createColumnHelper } from '@tanstack/react-table'
import { FaEdit, FaTrash } from 'react-icons/fa'
import {
  fetchAllCategories,
  selectAllCategories,
} from '@/features/categories/categoriesSlice'
import { useRouter } from 'next/navigation'
import { TanstackTable } from '@/components/admin/TanStackTable'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { useTableQueryParams } from '@/components/admin/TanStackTable'

const columnHelper = createColumnHelper()

// Define columns inside the component to access router
const getColumns = (router) => [
  columnHelper.accessor('_id', {
    header: 'ID',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
    cell: (info) => {
      const { name, parent, parentName } = info.row.original
      return parent ? `${name} / ${parentName || ''}` : name
    },
  }),
  columnHelper.accessor('image', {
    header: 'Image',
    enableSorting: false,
    cell: (info) => {
      const value = info.getValue();
      const name = info.row.original.name;
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
      );
    }
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
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/admin/categories/edit/${row.original._id}`)
          }}
          title="Edit"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            if (
              confirm(`Are you sure you want to delete ${row.original.name}?`)
            ) {
              // Handle delete logic here
              alert(`Deleting ${row.original.name}`)
            }
          }}
          title="Delete"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    ),
  }),
]

// This component is wrapped in Suspense to handle search params
function CategoriesDisplayContent() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()
  
  // Create columns with router
  const columns = useMemo(() => getColumns(router), [router])

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

  // Fetch categories when URL params change
  useEffect(() => {
    const getCategories = async () => {
      try {
        dispatch(
          fetchAllCategories({
            search: params?.search || undefined,
            sortBy: params?.sortBy,
            direction: params?.sortBy ? params.direction : undefined,
            page: params?.pageIndex + 1,
            limit: params?.pageSize || 10,
            filterBy: params?.filterBy || undefined,
          })
        )
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    getCategories()
  }, [dispatch, params])

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

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
        ]
      },
    ],
    []
  )

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
