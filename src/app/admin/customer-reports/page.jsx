'use client'

import {
  TanstackTable,
  useTableQueryParams,
} from '@/components/admin/TanStackTable'
import { customerReportsData } from '@/features/order/orderSlice'
import { createColumnHelper } from '@tanstack/react-table'
import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const columnHelper = createColumnHelper()

function CustomerReportsTableContent() {
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()

  const {
    data,
    pagination: apiPagination,
    isLoading,
    message: error,
  } = useSelector((state) => state.order.customerReportsData)

  const getCustomerReports = useCallback(() => {
    dispatch(
      customerReportsData({
        search: params?.search ?? undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortBy ? params.direction : undefined,
        page: params?.pageIndex + 1,
        limit: params?.pageSize ?? 10,
        filterBy: params?.filterBy || undefined,
      }),
    )
  }, [dispatch, params])

  useEffect(() => {
    getCustomerReports()
  }, [getCustomerReports])

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: 'Rank',
        cell: ({ row }) => row.index + 1,
      }),
      columnHelper.accessor('fullName', {
        header: 'Customer Name',
        enableSorting: true,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        enableSorting: true,
      }),
      columnHelper.accessor('mobileNo', {
        header: 'Mobile No',
        enableSorting: true,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('createdAt', {
        header: 'Member Since',
        enableSorting: true,
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor('orderCount', {
        header: '# of Orders',
        enableSorting: true,
      }),
      columnHelper.accessor('totalSpent', {
        header: 'Total Spent',
        enableSorting: true,
        cell: ({ getValue }) => `₹${getValue().toLocaleString('en-IN')}`,
      }),
    ],
    [],
  )
  const filterByOptions = useMemo(() => [
    { label: 'fullName', value: 'fullName' },
    { label: 'email', value: 'email' },
    { label: 'mobileNo', value: 'mobileNo' },
  ])

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Reports</h1>
      <TanstackTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        mode="server"
        pageCount={apiPagination?.totalPages || 1}
        filterByOptions={filterByOptions}
      />
    </div>
  )
}

export default function CustomerReportsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CustomerReportsTableContent />
    </Suspense>
  )
}
