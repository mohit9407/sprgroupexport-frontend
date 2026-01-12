'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanstackTable'
import { useRouter } from 'next/navigation'
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminOrders } from '@/features/order/orderSlice'
import { fetchOrderStatuses } from '@/features/orderStatus/orderStatusSlice'

const columnHelper = createColumnHelper()

export default function OrdersPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [sorting, setSorting] = useState([])
  const [filterBy, setFilterBy] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Keep the pending filter in a ref so selecting it doesn't immediately change getOrders identity
  const filterRef = useRef(filterBy)

  const handleFilterChange = (val) => {
    setFilterBy(val)
    filterRef.current = val
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer Name',
        enableSorting: false,
      }),
      columnHelper.accessor('orderTotal', {
        header: 'Order Total',
        enableSorting: false,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('datePurchased', {
        header: 'Date Purchased',
        enableSorting: false,
        cell: (info) => {
          const date = new Date(info.getValue())
          const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          return <span>{dateString}</span>
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        enableSorting: false,
        cell: (info) => {
          const status = info.getValue()
          let bgColor = 'bg-gray-200 text-gray-800'

          switch (status?.toLowerCase()) {
            case 'completed':
              bgColor = 'bg-green-100 text-green-800'
              break
            case 'pending':
              bgColor = 'bg-yellow-100 text-yellow-800'
              break
            case 'processing':
              bgColor = 'bg-blue-100 text-blue-800'
              break
            case 'shipped':
              bgColor = 'bg-purple-100 text-purple-800'
              break
            case 'cancelled':
              bgColor = 'bg-red-100 text-red-800'
              break
          }

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}
            >
              {status || 'Pending'}
            </span>
          )
        },
      }),
      columnHelper.display({
        id: 'action',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.id

          const handleEdit = (e) => {
            e.stopPropagation()
            router.push(`/admin/orders/${id}`)
          }

          const handleDelete = (e) => {
            e.stopPropagation()
            if (confirm('Are you sure you want to delete this order?')) {
              console.log('Delete order', id)
            }
          }

          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full hover:text-blue-700 transition-colors"
                title="Edit Order"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
                title="Delete Order"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          )
        },
      }),
    ],
    [router],
  )

  // Get orders and statuses from Redux store
  const {
    items: orders,
    loading,
    error,
    pagination: serverPagination,
  } = useSelector((state) => state.order.adminOrders)

  const { statuses: orderStatuses } = useSelector((state) => state.orderStatus)

  // Fetch order statuses on component mount
  useEffect(() => {
    dispatch(fetchOrderStatuses())
  }, [dispatch])

  const getOrders = useCallback(
    async (search = searchTerm, page) => {
      try {
        const sort = sorting[0]
        const sortType = sort?.desc ? 'desc' : 'asc'
        const filter = filterRef.current

        dispatch(
          fetchAdminOrders({
            searchValue: search || undefined,
            sortBy: sort?.id,
            direction: sort?.id ? sortType : undefined,
            page: page ?? pagination.pageIndex + 1,
            limit: pagination.pageSize,
            filterBy: filter || undefined,
          }),
        )
      } catch (error) {
        console.error(error)
      }
    },
    [sorting, pagination.pageSize, pagination.pageIndex, dispatch, searchTerm],
  )

  useEffect(() => {
    getOrders()
  }, [pagination.pageIndex, getOrders])

  // Format data for table
  const tableData = orders.map((order) => {
    // Get the status ID from orderStatus field (not status)
    const statusId = order.orderStatus || order.status

    // Find the status object that matches the order's status ID
    const statusObj = orderStatuses.find((s) => s._id === statusId) || {}

    // Get the status name from the status object
    const statusName = statusObj.orderStatus || statusObj.name || 'Pending'

    return {
      id: order.orderId || order._id,
      customerName: order.user
        ? `${order.user.firstName} ${order.user.lastName}`
        : 'Guest',
      orderTotal: `${order.total?.toFixed(2) || '0.00'}`,
      datePurchased: order.createdAt,
      status: statusName,
      _id: order._id,
      statusId: statusId, // Keep the status ID for reference
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <TanstackTable
        columns={columns}
        data={tableData}
        isLoading={loading}
        mode="server"
        pageCount={serverPagination?.totalPages || 1}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        // onSearch={(val) => setSearchTerm(val)}
        filterByValue={filterBy}
        filterByOptions={[
          {
            label: 'Name',
            value: 'name',
            type: 'text',
          },
          {
            label: 'Status',
            value: 'orderStatus',
            type: 'select',
            options: orderStatuses.map((status) => ({
              label: status.orderStatus || status.name,
              value: status._id,
            })),
          },
        ]}
        statusOptions={orderStatuses.map((status) => ({
          label: status.orderStatus || status.name,
          value: status._id,
        }))}
        onFilterChange={handleFilterChange}
        onSearch={(val) => {
          setPagination((p) => ({ ...p, pageIndex: 0 }))
          getOrders(val, 1)
        }}
      />
    </div>
  )
}
