import React from 'react'

const OrderInformation = ({
  order,
  orderStatus,
  loadingDetails,
  shippingAddress,
}) => {
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
          <h3 className="font-medium text-gray-700">Shipping Cost</h3>
          <p className="text-gray-600">₹{order.shipping.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default OrderInformation
