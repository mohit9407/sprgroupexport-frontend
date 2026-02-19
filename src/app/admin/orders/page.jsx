'use client'

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { FaEdit, FaTrash } from 'react-icons/fa'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminOrders, deleteOrder } from '@/features/order/orderSlice'
import { fetchOrderStatuses } from '@/features/orderStatus/orderStatusSlice'
import {
  TanstackTable,
  useTableQueryParams,
} from '@/components/admin/TanStackTable'
import { toast } from '@/utils/toastConfig'
import { Eye } from 'lucide-react'

const columnHelper = createColumnHelper()

function OrdersPageContent() {
  const router = useRouter()
  const { params } = useTableQueryParams()
  const dispatch = useDispatch()
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
      columnHelper.accessor('isAdminOrderCreated', {
        header: 'Admin Order',
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue()

          return value ? (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-900 rounded-full">
              Yes
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              No
            </span>
          )
        },
      }),
      columnHelper.accessor('paidAmount', {
        header: 'Paid Amount',
        enableSorting: true,
        cell: ({ getValue }) => `₹${getValue() ?? 0}`,
      }),
      columnHelper.accessor('remainingAmount', {
        header: 'Remaining Amount',
        enableSorting: true,
        cell: ({ getValue }) => `₹${getValue() ?? 0}`,
      }),
      columnHelper.display({
        id: 'action',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.id
          const paymentMethod = row.original.paymentMethod

          const RAZORPAY_ID = '695cae6321d3f5118b0c8c94'
          const PAYPAL_ID = '695ccf386ea6dadf0aa1c14c'
          const COD_ID = '695cae5421d3f5118b0c8c91'
          const OFFLINE_ID = '6992b463d4ae5d4dfaa75469'

          const handleEdit = (e) => {
            e.stopPropagation()
            router.push(`/admin/orders/${id}`)
          }

          const handleDeleteClick = (e) => {
            e.stopPropagation()
            setSelectedOrderId(id)
            setShowDeleteModal(true)
          }

          const handleViewPaymentDetails = (e) => {
            e.stopPropagation()

            const paymentId = row.original.paymentProviderOrderId

            if (!paymentId) {
              toast.error('No payment details found')
              return
            }

            if (paymentMethod === RAZORPAY_ID) {
              window.open(
                `https://dashboard.razorpay.com/app/payments/${paymentId}`,
                '_blank',
              )
            }

            if (paymentMethod === PAYPAL_ID) {
              window.open(
                `https://www.sandbox.paypal.com/unifiedtransactions/details/payment/${paymentId}`,
                '_blank',
              )
            }
          }

          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <FaEdit className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
              >
                <FaTrash className="w-4 h-4" />
              </button>
              {paymentMethod !== COD_ID && paymentMethod !== OFFLINE_ID && (
                <button
                  onClick={handleViewPaymentDetails}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                  title="View Payment"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
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

  const getOrders = async () => {
    try {
      dispatch(
        fetchAdminOrders({
          searchValue: params?.search || undefined,
          sortBy: params?.sortBy,
          direction: params?.sortBy ? params?.direction : undefined,
          page: (params?.pageIndex ?? 0) + 1,
          limit: params?.pageSize,
          filterBy: params?.filterBy || undefined,
        }),
      )
    } catch (error) {
      console.error(error)
    }
  }

  // Fetch order statuses on component mount
  useEffect(() => {
    dispatch(fetchOrderStatuses())
  }, [dispatch])

  useEffect(() => {
    getOrders()
  }, [params])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedOrderId) return

    setIsDeleting(true)
    try {
      // Replace this with actual delete order dispatch when implemented
      await dispatch(deleteOrder(selectedOrderId)).unwrap()
      toast.success('Order deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error(error.message || 'Failed to delete order')
    } finally {
      setIsDeleting(false)
      setSelectedOrderId(null)
    }
  }, [selectedOrderId])

  // Format data for table
  const tableData = useMemo(
    () =>
      orders.map((order) => {
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
          paymentProviderOrderId: order.paymentProviderOrderId,
          paymentMethod: order.paymentMethod,
          isAdminOrderCreated: order.isAdminOrderCreated,
          paidAmount: order.paidAmount,
          remainingAmount: order.remainingAmount,
        }
      }),
    [orders, orderStatuses],
  )

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
        filterByOptions={[
          {
            label: 'Name',
            value: 'name',
            type: 'text',
          },
          {
            label: 'Order ID',
            value: 'id',
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
          {
            label: 'Admin Created Order',
            value: 'isAdminOrderCreated',
            type: 'select',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          },
        ]}
      />

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedOrderId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        theme="error"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default function OrdersPage() {
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
      <OrdersPageContent />
    </Suspense>
  )
}
