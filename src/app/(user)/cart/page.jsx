'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { FiShoppingBag, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'
import Link from 'next/link'
import ConfirmationModal from '@/components/admin/ConfirmationModal'

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    removeAllFromCart,
  } = useCart()
  const [coupon, setCoupon] = useState('')
  const [showClearCartModal, setShowClearCartModal] = useState(false)

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
  }

  const subtotal = getCartTotal()
  const discount = 0 // You can implement coupon logic here
  const total = subtotal - discount

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="text-4xl text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link
            href="/"
            className="bg-[#BA8B4E] hover:bg-[#a87d45] text-white px-8 py-3 rounded-full font-medium transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <button 
        onClick={() => window.history.back()}
        className="flex items-center text-gray-600 hover:text-[#BA8B4E] mb-6 transition-colors"
      >
        <svg 
          className="w-5 h-5 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        SHOPPING CART
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cart.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  {/* Product Info */}
                  <div className="col-span-5 flex items-center">
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                        unoptimized={true}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.brand}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center">
                    <span className="md:hidden text-sm text-gray-500 mr-2">
                      Price:
                    </span>
                    <span className="font-medium">
                      ₹{item.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-100"
                      >
                        <FiMinus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-12 h-8 border-t border-b border-gray-300 text-center"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-100"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="text-right">
                      <div className="font-medium">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center justify-end w-full mt-1"
                      >
                        <FiTrash2 size={14} className="mr-1" />
                        <span className="md:hidden">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors mb-4 sm:mb-0 flex items-center"
            >
              ← Continue Shopping
            </Link>
            <button
              onClick={() => setShowClearCartModal(true)}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center"
              disabled={cart.length === 0}
            >
              <FiTrash2 className="mr-2" /> Clear Cart
            </button>
            
            <ConfirmationModal
              open={showClearCartModal}
              onClose={() => setShowClearCartModal(false)}
              onConfirm={async () => {
                await removeAllFromCart()
                setShowClearCartModal(false)
              }}
              title="Clear Cart"
              description="Are you sure you want to clear your cart? This action cannot be undone."
              confirmText="Clear Cart"
              theme="error"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">
                  -₹{discount.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Apply Coupon Code</p>
                <div className="flex">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#BA8B4E] focus:border-transparent"
                  />
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-r transition-colors"
                    onClick={() => {}}
                  >
                    APPLY
                  </button>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-[#BA8B4E] hover:bg-[#a87d45] text-white text-center py-3 rounded-full font-medium mt-6 transition-colors"
              >
                PROCEED TO CHECKOUT
              </Link>

              <div className="flex justify-center mt-4">
                <Link
                  href="/"
                  className="text-[#BA8B4E] hover:underline text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
