import React from 'react'

const CustomerInformation = ({ order, shippingAddress, paymentMethod }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-gray-700">Contact Information</h3>
          <p className="mt-1">{order.customer.name}</p>
          <p className="text-gray-600">{order.customer.email}</p>
          <p className="text-gray-600">{order.customer.phone}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Shipping Address</h3>
          {shippingAddress ? (
            <div className="mt-1 space-y-1">
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.address}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state}{' '}
                {shippingAddress.zipCode}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.mobileNo && (
                <p>Phone: {shippingAddress.mobileNo}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Loading address...</p>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Billing Address</h3>
          {shippingAddress ? (
            <div className="mt-1 space-y-1">
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.address}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state}{' '}
                {shippingAddress.zipCode}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.mobileNo && (
                <p>Phone: {shippingAddress.mobileNo}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Same as shipping address</p>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Payment Method</h3>
          <p className="mt-1 font-bold text-yellow-600">
            {order.paymentMethod?.name || order.paymentMethod}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CustomerInformation
