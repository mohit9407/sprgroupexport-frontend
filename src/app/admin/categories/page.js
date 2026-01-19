'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanStackTable/TanstackTable'
import { FaEdit, FaTrash } from 'react-icons/fa'
import {
  fetchAllCategories,
  selectAllCategories,
} from '@/features/categories/categoriesSlice'
import { useRouter } from 'next/navigation'

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
    cell: (info) => (
      <div className="w-20 h-20 bg-gray-100 grid place-items-center overflow-hidden">
        {info.getValue() ? (
          <img
            src={info.getValue()}
            alt={info.row.original.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-gray-400 text-sm">No Image</span>
        )}
      </div>
    ),
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

export default function CategoriesDisplayPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('')

  // Create columns with router
  const columns = useMemo(() => {
    return getColumns(router)
  }, [router])

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

  const getCategories = async (search = '', page) => {
    try {
      const sort = sorting[0]
      const sortType = sort?.desc ? 'desc' : 'asc'
      const pageNumber = page !== undefined ? page : pagination.pageIndex + 1

      const params = {
        search: search || undefined,
        sortBy: sort?.id,
        direction: sort?.id ? sortType : undefined,
        page: pageNumber,
        limit: pagination.pageSize,
        filterBy: filterBy || undefined,
      }

      // Ensure we're sending valid page numbers
      if (isNaN(pageNumber) || pageNumber < 1) {
        params.page = 1
      }

      dispatch(fetchAllCategories(params))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Fetch categories when sorting, pagination, or filters change
  useEffect(() => {
    getCategories()
  }, [sorting, pagination.pageIndex, pagination.pageSize])

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <TanstackTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        mode="server"
        pageCount={apiPagination?.totalPages || 1}
        pagination={{
          ...pagination,
          pageCount: apiPagination?.totalPages || 1,
          total: apiPagination?.totalItems || 0,
        }}
        sorting={sorting}
        onPaginationChange={(newPagination) => {
          setPagination(newPagination)
          getCategories(searchTerm, newPagination.pageIndex + 1)
        }}
        onSortingChange={(newSorting) => {
          setSorting(newSorting)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
        onSearch={(value) => {
          setSearchTerm(value)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
          getCategories(value, 1)
        }}
        filterByValue={filterBy}
        filterByOptions={[
          {
            label: 'Name',
            value: 'name',
            type: 'text',
          },
          {
            label: 'Status',
            value: 'status',
            type: 'select',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
        onFilterChange={(value) => {
          setFilterBy(value)
        }}
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
