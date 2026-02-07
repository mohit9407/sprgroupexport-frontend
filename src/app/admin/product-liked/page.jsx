'use client'

import {
  TanstackTable,
  useTableQueryParams,
} from '@/components/admin/TanStackTable'
import { fetchAllProduct } from '@/features/products/productsSlice'
import { createColumnHelper } from '@tanstack/react-table'
import Image from 'next/image'
import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const columnHelper = createColumnHelper()

function ProductLikedContent() {
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()

  const {
    data,
    pagination: apiPagination,
    isLoading,
  } = useSelector((state) => state.products.fetchAllProduct)

  const getProduct = useCallback(() => {
    dispatch(
      fetchAllProduct({
        search: params?.search ?? undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortBy ? params.direction : undefined,
        filterBy: params?.filterBy || undefined,
        page: params?.pageIndex + 1,
        limit: params?.pageSize ?? 10,
        onlyLiked: true,
      }),
    )
  }, [dispatch, params])

  useEffect(() => {
    getProduct()
  }, [getProduct])

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: 'ID',
        cell: ({ row }) => row.index + 1,
      }),
      columnHelper.accessor('image', {
        header: 'Product Image',
        enableSorting: false,
        cell: (info) => {
          const imageData = info.getValue()
          const imageUrl =
            typeof imageData === 'object'
              ? imageData?.thumbnailUrl || imageData?.originalUrl
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
                />
              ) : (
                <span className="text-gray-400 text-xs">No image</span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('productName', {
        header: 'Product Name',
        enableSorting: true,
      }),
      columnHelper.accessor('likeCount', {
        header: 'Like Count',
        enableSorting: true,
      }),
    ],
    [],
  )

  const filteredData = useMemo(() => {
    return (data || []).filter((p) => p.likeCount > 0)
  }, [data])

  const filterOptions = useMemo(() => [
    { label: 'Like Count', value: 'likeCount' },
    { label: 'Product Name', value: 'productName' },
  ])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">Liked Product List</h1>

      <TanstackTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        mode="server"
        pageCount={apiPagination?.totalPages}
        filterByOptions={filterOptions}
      />
    </div>
  )
}

export default function ProductLiked() {
  return (
    <Suspense fallback={<div className="p-6">Loading....</div>}>
      <ProductLikedContent />
    </Suspense>
  )
}
