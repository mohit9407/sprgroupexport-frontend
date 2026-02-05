'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { FiShoppingBag, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'
import Link from 'next/link'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { toast, Toaster } from '@/utils/toastConfig'

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    removeAllFromCart,
    isLoading,
    error: cartError,
  } = useCart()
  const [coupon, setCoupon] = useState('')
  const [showClearCartModal, setShowClearCartModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const [error, setError] = useState(null)
  const [localQuantities, setLocalQuantities] = useState({})

  useEffect(() => {
    setIsClient(true)
  }, [])
  const handleQuantityChange = async (productId, newQuantity) => {
    if (!updatingItemId) {
      try {
        const product = cart.find((item) => item.id === productId)

        // Check min order limit
        if (
          product?.product?.minOrderLimit &&
          newQuantity < product.product.minOrderLimit
        ) {
          toast.error(
            `Minimum order quantity is ${product.product.minOrderLimit}`,
          )
          return
        }

        // Check max order limit
        if (
          product?.product?.maxOrderLimit &&
          newQuantity > product.product.maxOrderLimit
        ) {
          toast.error(
            `Maximum order quantity is ${product.product.maxOrderLimit}`,
          )
          return
        }

        // Check stock availability
        if (
          product?.product?.stock !== undefined &&
          newQuantity > product.product.stock
        ) {
          toast.error(`Only ${product.product.stock} items available in stock`)
          return
        }
        setUpdatingItemId(productId)

        try {
          await updateQuantity(productId, newQuantity)
          toast.success('Cart updated successfully')
        } catch {}
      } catch (error) {
        console.error('Error updating quantity:', error)
        toast.error(error.message || 'Failed to update quantity')
      } finally {
        setUpdatingItemId(null)
      }
    }
  }

  const handleRemoveItem = async (productId) => {
    if (!updatingItemId) {
      try {
        setUpdatingItemId(productId)
        await removeFromCart(productId)
      } catch (error) {
        console.error('Error removing item:', error)
      } finally {
        setUpdatingItemId(null)
      }
    }
  }

  const subtotal = getCartTotal()
  const discount = 0 // You can implement coupon logic here
  const total = subtotal - discount
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BA8B4E]"></div>
      </div>
    )
  }

  if (cartError) {
    toast.error(cartError)
    // Clear the error after showing it
    setTimeout(() => setError(null), 100)
  }

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
    <div className="container mx-auto px-4 py-8">
      <Toaster />
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
                    <Link
                      href={`/products/${item.slug || item.id}`}
                      className="flex items-center w-full"
                    >
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <Image
                          src={
                            item.product?.image?.thumbnailUrl ||
                            '/placeholder-product.jpg'
                          }
                          alt={
                            item.name || item.product?.productName || 'Product'
                          }
                          fill
                          className="object-cover rounded hover:opacity-90 transition-opacity"
                          unoptimized={true}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900 hover:text-[#BA8B4E] transition-colors">
                          {item.name || item.product?.productName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.brand || item.product?.brand}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center">
                    <span className="md:hidden text-sm text-gray-500 mr-2">
                      Price:
                    </span>
                    <span className="font-medium">
                      ₹{(item.price || item.product?.price)?.toLocaleString()}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            (item.quantity || 1) - 1,
                          )
                        }
                        disabled={updatingItemId === item.id}
                        className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-100 ${
                          updatingItemId === item.id
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <FiMinus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={localQuantities[item.id] !== undefined ? localQuantities[item.id] : (item.quantity || 1)}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 1;
                          setLocalQuantities(prev => ({
                            ...prev,
                            [item.id]: newValue
                          }));
                        }}
                        onBlur={(e) => {
                          const newValue = parseInt(e.target.value) || 1;
                          if (newValue !== (item.quantity || 1)) {
                            handleQuantityChange(item.id, newValue);
                          }
                          // Clear the local quantity after blur to sync with server
                          setLocalQuantities(prev => {
                            const newState = {...prev};
                            delete newState[item.id];
                            return newState;
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur(); // Trigger blur to save when Enter is pressed
                          }
                        }}
                        disabled={updatingItemId === item.id}
                        className={`w-12 h-8 border-t border-b border-gray-300 text-center ${
                          updatingItemId === item.id ? 'bg-gray-50' : ''
                        }`}
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            (item.quantity || 1) + 1,
                          )
                        }
                        disabled={updatingItemId === item.id}
                        className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-100 ${
                          updatingItemId === item.id
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="font-medium min-w-[100px] text-right">
                        ₹
                        {(
                          (item.price || item.product?.price) *
                          (item.quantity || 1)
                        ).toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingItemId === item.id}
                        className={`text-red-500 hover:text-red-700 text-sm flex-shrink-0 ${
                          updatingItemId === item.id
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <FiTrash2 size={16} />
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
