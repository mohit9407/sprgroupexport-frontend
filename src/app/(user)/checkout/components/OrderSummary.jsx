import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function OrderSummary({
  cartItems = [],
  shippingMethod = {},
  orderTotal = 0,
  currentStep = 1,
  onContinue,
  isLoading = false,
  error = null,
  paymentMethod = '',
}) {
  const [showError, setShowError] = useState(false);
  
  // Clear error when payment method is selected
  useEffect(() => {
    if (paymentMethod) {
      setShowError(false);
    }
  }, [paymentMethod]);
  
  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  // Calculate shipping cost based on selected method
  const shippingCost = Number(shippingMethod?.price) || 0

  // Calculate total numerically
  const total = Number(subtotal) + Number(shippingCost)

  const summaryItems = [
    {
      label: 'Sub Total',
      value: `₹${Number(subtotal).toLocaleString('en-IN')}`,
    },
    { label: 'Discount', value: '₹0' },
    {
      label: 'Shipping Cost',
      value: shippingCost > 0 ? `₹${Number(shippingCost).toLocaleString('en-IN')}` : 'FREE',
    },
  ]
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
                  src={item.image.thumbnailUrl}
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
      {/* Order Total */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Order Total</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {error && (
          <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        {showError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Payment Method Required</p>
            <p className="text-sm">Please select a payment method to continue with your order.</p>
          </div>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => onContinue({}, currentStep + 1)}
            className="w-full bg-[#c89b5a] text-white py-3 px-4 rounded-md hover:bg-[#b38b4a] transition-colors font-medium uppercase text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {currentStep === 1 ? 'Continue to Shipping' : 'Continue to Payment'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!paymentMethod) {
                setShowError(true);
                return;
              }
              setShowError(false);
              onContinue({}, 'placeOrder');
            }}
            className="w-full bg-[#c89b5a] text-white py-3 px-4 rounded-md hover:bg-[#b38950]
             transition-colors font-medium uppercase text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                PLACING ORDER...
              </>
            ) : (
              'PLACE ORDER'
            )}
          </button>
        )}
      </div>

      {/* Back to Cart Link - Only show if not in final step */}
      {currentStep < 3 && (
        <div className="mt-4 text-center">
          <Link
            href="/cart"
            className="text-sm text-gray-600 hover:text-[#c89b5a] transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      )}
    </div>
  )
}
