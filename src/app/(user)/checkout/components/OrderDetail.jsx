import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export default function OrderDetail({
  onContinue,
  paymentMethod: initialPaymentMethod = 'cod',
}) {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod)
  const [orderNotes, setOrderNotes] = useState('')

  // Calculate order total
  const orderTotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const handleEditItem = (productId) => {
    // Navigate to product detail page or open edit modal
    // For now, we'll just log the action
    console.log('Edit item:', productId)
  }

  const handleDeleteItem = (productId) => {
    if (
      window.confirm(
        'Are you sure you want to remove this item from your cart?',
      )
    ) {
      removeFromCart(productId)
    }
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.() // Safely call preventDefault if e exists
    onContinue(
      {
        paymentMethod,
        orderNotes,
      },
      'placeOrder',
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold uppercase mb-6">Order Detail</h2>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cart.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0 h-24 w-24 relative">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-xs text-gray-500 uppercase">
                    {item.category || 'Jewelry'}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Edit/Delete Buttons */}
                  <div className="mt-2 flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handleEditItem(item.id)}
                      className="text-xs text-[#c89b5a] hover:underline flex items-center"
                    >
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-xs text-red-600 hover:underline flex items-center"
                    >
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-bold">Order Total</span>
            <span className="text-[#c89b5a] text-xl font-bold">
              ₹{orderTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        {/* Order Notes */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Order Notes & Summary
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Please write notes of your order
          </p>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100 text-sm"
            placeholder="Notes about your order, e.g. special notes for delivery"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">
            PAYMENT METHODS
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Please select a preferred payment method to use on this order.
          </p>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="cod"
                name="payment-method"
                type="radio"
                className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] border-gray-300"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              <label
                htmlFor="cod"
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                Cash on Delivery
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="razorpay"
                name="payment-method"
                type="radio"
                className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] border-gray-300"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
              />
              <label
                htmlFor="razorpay"
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                Razor Pay
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium hover:bg-[#b38950] transition-colors"
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </form>
  )
}
