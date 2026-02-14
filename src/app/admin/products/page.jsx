'use client'

import { useEffect, useMemo, Suspense, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { TanstackTable } from '@/components/admin/TanStackTable'
import { useTableQueryParams } from '@/components/admin/TanStackTable'
import {
  fetchProductsWithFilters,
  selectAllProducts,
  deleteProduct,
} from '@/features/products/productsSlice'
import {
  fetchAllCategories,
  selectAllCategories,
} from '@/features/categories/categoriesSlice'

// Define columns with router and dispatch
const getColumns = (router, dispatch, setDeleteModal) => [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: (info) => {
      const imageData = info.getValue()
      const imageUrl =
        typeof imageData === 'object'
          ? imageData?.thumbnailUrl || imageData?.mediumUrl
          : imageData

      return (
        <div className="w-16 h-16 relative bg-gray-100 flex items-center justify-center rounded">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Product"
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={
                !imageUrl?.startsWith('/') &&
                !imageUrl?.startsWith('http://localhost')
              }
            />
          ) : (
            <span className="text-gray-400 text-xs">No image</span>
          )}
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
    cell: (info) => {
      const value = info.getValue()
      return (
        <div className="flex flex-col">
          <span className="text-l text-gray-700">
            {info.row.original.productName || ''}
          </span>
        </div>
      )
    },
    size: 250,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: (info) => {
      const value = info.getValue()
      return typeof value === 'object' ? value?.name || 'N/A' : value || 'N/A'
    },
    size: 120,
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: (info) => {
      const value = info.getValue()
      return typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'
    },
    size: 100,
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: (info) => {
      const value = info.getValue()
      const stockValue =
        typeof value === 'object' ? value?.quantity || 0 : value || 0
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full ${stockValue > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {stockValue}
        </span>
      )
    },
    size: 80,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (info) => {
      const statusObj = info.row.original.status
      const status =
        typeof statusObj === 'object'
          ? statusObj?.value || 'inactive'
          : statusObj || 'inactive'
      const statusText =
        typeof statusObj === 'object'
          ? statusObj?.label || 'Inactive'
          : status || 'Inactive'
      const statusStyles = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-yellow-100 text-yellow-800',
      }

      return (
        <span
          className={`px-2 py-1 text-xs rounded-full ${statusStyles[status] || 'bg-gray-100'}`}
        >
          {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
        </span>
      )
    },
    size: 100,
  },
  {
    id: 'details',
    header: 'Details',
    cell: (info) => {
      const row = info.row.original
      const type =
        typeof row.type === 'object'
          ? row.type?.name || 'N/A'
          : row.type || 'N/A'
      const weight = row?.productDetails?.totalMetalWeight || 'N/A'
      const sales = row.salesCount || 0

      return (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Type:</span>
            <span className="capitalize">{type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Weight:</span>
            <span>{weight}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Sales:</span>
            <span>{sales}</span>
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 justify-center">
        <button
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full hover:text-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/admin/products/edit/${row.original._id}`)
          }}
          title="Edit Product"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteModal({
              open: true,
              id: row.original._id,
              name: row.original.productName || 'this product',
            })
          }}
          title="Delete Product"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    ),
    size: 180,
  },
]

function ProductsDisplayContent() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()
  const [categories, setCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: '',
  })

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const response = await dispatch(fetchAllCategories({ limit: 1000 }))
        if (response.payload?.data) {
          const categoriesData = Array.isArray(response.payload.data)
            ? response.payload.data
            : response.payload.data.data || []

          const formattedCategories = categoriesData.map((category) => ({
            label: category.name,
            value: category._id,
          }))

          setCategories(formattedCategories)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [dispatch])

  // Create columns with router
  const columns = useMemo(
    () => getColumns(router, dispatch, setDeleteModal),
    [router, dispatch],
  )

  const {
    data: products = [],
    items,
    pagination: apiPagination = {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
    isLoading = false,
    error = null,
  } = useSelector(selectAllProducts) || {}

  const filterByOptions = useMemo(
    () => [
      { label: 'Name', value: 'productName' },
      {
        label: 'Status',
        value: 'status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
      {
        label: 'Type',
        value: 'productType',
        type: 'select',
        options: [
          { label: 'Simple', value: 'simple' },
          { label: 'Variable', value: 'variable' },
          { label: 'External', value: 'external' },
        ],
      },
      {
        label: 'Category',
        value: 'category',
        type: 'select',
        options: [{ label: 'All Categories', value: '' }, ...categories],
        isLoading: isLoadingCategories,
      },
    ],
    [categories, isLoadingCategories],
  )

  const handleDelete = async () => {
    if (!deleteModal.id) return

    try {
      await dispatch(deleteProduct(deleteModal.id)).unwrap()
      // Refresh the products list after successful deletion
      await dispatch(
        fetchProductsWithFilters({
          page: params?.pageIndex ? parseInt(params.pageIndex) + 1 : 1,
          limit: params?.pageSize || 10,
          filterBy: params?.filterBy || undefined,
          search: params?.search || undefined,
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.direction || undefined,
        }),
      ).unwrap()
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error(error.message || 'Failed to delete product')
    } finally {
      setDeleteModal({ ...deleteModal, open: false })
    }
  }

  // Fetch products with filters when URL params change
  useEffect(() => {
    const getProducts = async () => {
      try {
        dispatch(
          fetchProductsWithFilters({
            page: params?.pageIndex ? parseInt(params.pageIndex) + 1 : 1,
            limit: params?.pageSize || 10,
            filterBy: params?.filterBy || undefined,
            search: params?.search || undefined,
            sortBy: params?.sortBy || undefined,
            sortOrder: params?.direction || undefined,
          }),
        )
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    getProducts()
  }, [dispatch, params])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
      </div>

      {error ? (
        <div className="p-6 text-red-500">Error: {error}</div>
      ) : (
        <TanstackTable
          columns={columns}
          data={items || []}
          isLoading={isLoading}
          mode="server"
          pageCount={apiPagination?.totalPages}
          filterByOptions={filterByOptions}
          actions={
            <button
              className="bg-sky-600 text-white px-4 py-2 rounded text-sm hover:bg-sky-700 transition-colors flex items-center gap-2"
              onClick={() => router.push('/admin/products/add')}
            >
              <FaPlus /> Add Product
            </button>
          }
        />
      )}

      <ConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete ${deleteModal.name || 'this product'}?`}
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}

export default function ProductsPage() {
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
      <ProductsDisplayContent />
    </Suspense>
  )
}
