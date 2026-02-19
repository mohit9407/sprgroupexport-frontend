import React from 'react'

const OrderInformation = ({
  order,
  orderStatus,
  loadingDetails,
  shippingAddress,
  onUpdatePaidAmount,
}) => {
  const [paidInput, setPaidInput] = React.useState(order?.paidAmount || 0)

  React.useEffect(() => {
    setPaidInput(order?.paidAmount || 0)
  }, [order?.paidAmount])

  const handlePaidChange = (e) => {
    const value = Number(e.target.value) || 0
    setPaidInput(value)
    onUpdatePaidAmount?.(value)
  }

  const remainingAmount = Math.max(0, (order?.total || 0) - paidInput)

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Order Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-gray-700">Order ID</h3>
          <p className="text-gray-600">{order.orderId}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Order Date</h3>
          <p className="text-gray-600">
            {new Date(order.orderDate).toLocaleString()}
          </p>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Status</h3>
          {loadingDetails.orderStatus ? (
            <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
          ) : orderStatus ? (
            <span
              className={`px-2 py-1 text-sm rounded-full ${getStatusColor(orderStatus)}`}
            >
              {orderStatus}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">Loading status...</span>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Payment Status</h3>
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              order.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {order.paymentStatus || 'Pending'}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Shipping Method</h3>
          <p className="text-gray-600">
            {order.originalData?.shippingMethod?.name || 'Standard Shipping'}
          </p>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Shipping Courier</h3>
          <p className="text-gray-600">
            {order.originalData?.shippingCourier || 'Not set'}
          </p>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Shipping Cost</h3>
          <p className="text-gray-600">₹{order.shipping.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">paidAmount</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={paidInput}
              onChange={(e) => setPaidInput(Number(e.target.value) || 0)}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm w-32 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              min="0"
            />

            <button
              type="button"
              className="inline-flex items-center px-3 py-2 mt-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => onUpdatePaidAmount?.(paidInput)}
            >
              Update Amount
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">remainingAmount</h3>
          <p className="text-gray-600 inline-block bg-yellow-100 px-2 py-1 rounded">
            ₹{remainingAmount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderInformation
