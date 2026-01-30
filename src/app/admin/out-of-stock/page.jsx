'use client'

import { useMemo, Suspense, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { createColumnHelper } from '@tanstack/react-table'
import { useSelector, useDispatch } from 'react-redux'

import {
  TanstackTable,
  useTableQueryParams,
} from '@/components/admin/TanStackTable'

import {
  fetchOutOfStock,
  selectOutOfStockData,
  selectOutOfStockStatus,
  selectOutOfStockPagination,
} from '@/features/stock/stockSlice'

const columnHelper = createColumnHelper()

function OutOfStockContent() {
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()
  const [stockThreshold, setStockThreshold] = useState(0)

  const columns = useMemo(
    () => [
      columnHelper.accessor('_id', {
        header: 'ID',
        enableSorting: false,
      }),
      columnHelper.accessor('image', {
        header: 'Image',
        cell: (info) => {
          const imageData = info.getValue()
          const sideImages = info.row.original.sideImages

          let imageUrl = imageData?.thumbnailUrl || imageData?.originalUrl

          // Fallback to side images if no main image
          if (!imageUrl && sideImages && sideImages.length > 0) {
            const firstSideImage = sideImages[0]
            imageUrl =
              firstSideImage.thumbnailUrl ||
              firstSideImage.originalUrl ||
              firstSideImage.url
          }

          return (
            <div className="w-16 h-16 bg-gray-100 grid place-items-center overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={info.row.original.productName || 'Product'}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs">No Image</span>
              )}
            </div>
          )
        },
        enableSorting: false,
      }),
      columnHelper.accessor('productName', {
        header: 'Product Name',
        cell: (info) => (
          <div className="font-medium text-gray-900">{info.getValue()}</div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('stock', {
        header: 'View Stock',
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
    ],
    [],
  )

  const data = useSelector(selectOutOfStockData)
  const status = useSelector(selectOutOfStockStatus)
  const pagination = useSelector(selectOutOfStockPagination)

  const isLoading = status === 'loading'

  const getOutOfStockProducts = useCallback(() => {
    dispatch(
      fetchOutOfStock({
        page: (params?.pageIndex ?? 0) + 1,
        limit: params?.pageSize ?? 10,
        sortBy: params?.sortBy,
        maxStock: 1,
      }),
    )
  }, [dispatch, params])

  useEffect(() => {
    getOutOfStockProducts()
  }, [getOutOfStockProducts])

  const handleThresholdChange = () => {
    console.log('Button clicked! Current threshold:', stockThreshold)
    getLowStockProducts()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Out of Stock Products</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Stock Threshold:
          </label>
          <input
            type="number"
            value={stockThreshold}
            onChange={(e) => setStockThreshold(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            placeholder="30"
          />
          <button
            onClick={handleThresholdChange}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply
          </button>
        </div>
      </div>

      <TanstackTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        mode="server"
        pageCount={pagination.totalPages}
      />
    </div>
  )
}

export default function OutOfStockTable() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <OutOfStockContent />
    </Suspense>
  )
}
