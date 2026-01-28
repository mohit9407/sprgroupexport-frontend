'use client'

import { useMemo, Suspense, useCallback, useEffect } from 'react'
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('_id', {
        header: 'ID',
        enableSorting: false,
      }),
      columnHelper.accessor('image', {
        header: 'Image',
        cell: (info) => (
          <div className="w-20 h-20 bg-gray-100 grid place-items-center overflow-hidden">
            {info.getValue() ? (
              <Image
                src={info.getValue()}
                alt={info.row.original.productName || 'Product'}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
          </div>
        ),
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
        maxStock: 30,
      }),
    )
  }, [dispatch, params])

  useEffect(() => {
    getLowStockProducts()
  }, [getLowStockProducts])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Low Stock Products</h2>

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
