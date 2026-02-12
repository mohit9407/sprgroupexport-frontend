'use client'

import {
  TanstackTable,
  useTableQueryParams,
} from '@/components/admin/TanStackTable'
import { fetchAdminOrders } from '@/features/order/orderSlice'
import { createColumnHelper } from '@tanstack/react-table'
import Image from 'next/image'
import React, { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const columnHelper = createColumnHelper()
function TotalPurchasedContent() {
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()

  const {
    items: data,
    pagination,
    loading: isLoading,
  } = useSelector((state) => state.order.adminOrders)

  const fetchOrderData = useCallback(() => {
    dispatch(
      fetchAdminOrders({
        search: params?.search ?? undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortBy ? params.direction : undefined,
        filterBy: params?.filterBy || undefined,
        page: (params?.pageIndex ?? 0) + 1,
        limit: params?.pageSize ?? 10,
      }),
    )
  }, [dispatch, params])

  useEffect(() => {
    fetchOrderData()
  }, [fetchOrderData])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'id',
        header: 'ID',
        cell: (row) => row.row.index + 1,
      }),

      columnHelper.accessor('image', {
        header: 'Product Image',
        enableSorting: false,
        cell: (info) => {
          const imageData = info.getValue()
          const imageUrl =
            typeof imageData === 'object'
              ? imageData?.thumbnailUrl || imageData?.orimediumUrlginalUrl
              : imageData

          if (!imageUrl) return null

          return (
            <div className="w-16 h-16 relative bg-gray-100 rounded overflow-hidden">
              <Image
                src={imageUrl}
                alt="Product"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )
        },
      }),

      columnHelper.accessor('productName', {
        header: 'Product Name',
        enableSorting: false,
      }),

      columnHelper.accessor('createdAt', {
        header: 'Purchased Date',
        enableSorting: false,
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),

      columnHelper.accessor('updatedAt', {
        header: 'Updated Date',
        enableSorting: false,
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),

      //   columnHelper.accessor('stock', {
      //     header: 'Stock',
      //     enableSorting: false,
      //   }),

      //   columnHelper.accessor('price', {
      //     header: 'Price',
      //     enableSorting: false,
      //   }),
    ],
    [],
  )

  const tableData = useMemo(() => {
    if (!Array.isArray(data)) return []

    return data.flatMap((order) =>
      order.products.map((item) => ({
        id: order._id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        productName: item.productId?.productName,
        price: item.productId?.price,
        stock: item.productId?.stock,
        image: item.productId?.image,
      })),
    )
  }, [data])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">Total Purchased</h1>

      <TanstackTable
        columns={columns}
        data={tableData || []}
        pageCount={pagination?.totalPages ?? 0}
        mode="server"
        isLoading={isLoading}
      />
    </div>
  )
}

export default function TotalPurchased() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TotalPurchasedContent />
    </Suspense>
  )
}
