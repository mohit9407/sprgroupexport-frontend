import React from 'react'
import Image from 'next/image'

export default function OrderSummary({ cartItems = [] }) {
  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  const summaryItems = [
    { label: 'Sub Total', value: `₹${subtotal.toLocaleString('en-IN')}` },
    { label: 'Discount', value: '₹0' },
    { label: 'Tax', value: '₹0' },
    { label: 'Shipping Cost', value: '₹0' },
  ]

  const total = subtotal // Add other charges if needed

  return (
    <div className="border border-gray-200 p-6 rounded-lg h-fit sticky top-6">
      <h2 className="text-lg font-bold uppercase tracking-wide mb-6">
        ORDER SUMMARY
      </h2>

      {/* Cart Items */}
      <div className="mb-6 max-h-96 overflow-y-auto pr-2">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center py-4 border-b border-gray-100"
          >
            <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-4 text-sm">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}

        <div className="border-t border-gray-200 my-3"></div>

        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Total</span>
          <span className="text-[#c89b5a] text-xl font-bold">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  )
}
