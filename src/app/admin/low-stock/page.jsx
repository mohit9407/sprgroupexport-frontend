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
  fetchLowStock,
  selectLowStockData,
  selectLowStockStatus,
  selectLowStockPagination,
} from '@/features/stock/stockSlice'

const columnHelper = createColumnHelper()

function LowStockTableContent() {
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()
  const [stockThreshold, setStockThreshold] = useState(30)

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

          let imageUrl = imageData?.thumbnailUrl || imageData?.mediumUrl

          // Fallback to side images if no main image
          if (!imageUrl && sideImages && sideImages.length > 0) {
            const firstSideImage = sideImages[0]
            imageUrl =
              firstSideImage.thumbnailUrl ||
              firstSideImage.mediumUrl ||
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

  const data = useSelector(selectLowStockData)
  const status = useSelector(selectLowStockStatus)
  const pagination = useSelector(selectLowStockPagination)

  const isLoading = status === 'loading'

  const filteredData = useMemo(() => {
    return data.filter((product) => product.stock > 0)
  }, [data])

  const getLowStockProducts = useCallback(() => {
    dispatch(
      fetchLowStock({
        page: (params?.pageIndex ?? 0) + 1,
        limit: params?.pageSize ?? 10,
        sortBy: params?.sortBy,
        maxStock: stockThreshold,
      }),
    )
  }, [dispatch, params, stockThreshold])

  useEffect(() => {
    getLowStockProducts()
  }, [params])

  const handleThresholdChange = () => {
    console.log('Button clicked! Current threshold:', stockThreshold)
    getLowStockProducts()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Low Stock Products</h2>
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
        data={filteredData}
        isLoading={isLoading}
        mode="server"
        pageCount={pagination.totalPages}
      />
    </div>
  )
}

export default function LowStockTable() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LowStockTableContent />
    </Suspense>
  )
}
