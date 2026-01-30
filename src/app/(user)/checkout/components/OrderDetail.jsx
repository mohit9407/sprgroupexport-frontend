import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { paymentService } from '@/services/paymentService'
import { api } from '@/lib/axios'

export default function OrderDetail({
  onContinue,
  paymentMethod: initialPaymentMethod = 'cod',
  directCheckoutItem = null,
}) {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod)
  const [orderNotes, setOrderNotes] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)

  // Use directCheckoutItem if available, otherwise use cart
  const displayItems = directCheckoutItem ? [directCheckoutItem] : cart

  // Calculate order total
  const orderTotal = displayItems.reduce((total, item) => {
    return total + item.price * (item.quantity || 1)
  }, 0)

  // Fetch payment methods from API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentService.getAllPaymentMethods()
        // API returns array directly, not nested under status/data
        if (Array.isArray(response)) {
          setPaymentMethods(response)
        } else {
          console.log('Response is not an array:', response)
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error)
        console.error('Error details:', error.response?.data || error.message)
      } finally {
        setLoadingPaymentMethods(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  const handleEditItem = (productId) => {
    // Navigate to product detail page or open edit modal
    // For now, we'll just log the action
    console.log('Edit item:', productId)
  }

  const handleDeleteItem = (productId) => {
    setItemToDelete(productId)
  }

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete)
      setItemToDelete(null)
    }
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.() // Safely call preventDefault if e exists

    // If PayPal is selected, process payment and redirect
    if (paymentMethod === 'paypal') {
      try {
        // Calculate total amount
        const totalAmount = displayItems.reduce((total, item) => {
          return total + item.price * (item.quantity || 1)
        }, 0)

        // Find PayPal payment method ID
        const paypalMethodId = paymentMethods.find(
          (m) => m.type?.toUpperCase() === 'PAYPAL',
        )?._id

        if (!paypalMethodId) {
          alert(
            'PayPal payment method not found. Please select a different payment method.',
          )
          return
        }

        console.log('🚀 Making PayPal API call...')
        // For PayPal, we need to create the order first through normal flow, then process payment
        // But since we're bypassing normal flow, we need to create a temporary order ID
        const tempOrderId = 'temp_' + Date.now()
        const user = JSON.parse(localStorage.getItem('user'))

        // Prepare order data to be stored for later creation after PayPal success
        const shippingAddressId = JSON.parse(
          localStorage.getItem('selectedShippingAddress') || 'null',
        )
        const shippingMethod = JSON.parse(
          localStorage.getItem('selectedShippingMethod') || '{}',
        )

        console.log('Retrieved from localStorage:', {
          shippingAddressId,
          shippingMethod,
        })

        if (!shippingAddressId) {
          console.error('❌ Shipping address ID not found in localStorage!')
          alert(
            'Shipping address not found. Please go back and select a shipping address.',
          )
          return
        }

        const orderData = {
          user: user._id,
          shippingMethod: shippingMethod._id,
          shippingCost: shippingMethod.price || 0,
          shippingAddressId: shippingAddressId,
          products: displayItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity || 1,
          })),
          paymentMethod: paypalMethodId, // PayPal payment method ID
          paymentStatus: '695e0471c424c92fee37713b', // Pending status
          orderStatus: '693fea47bb389dcda0118800', // Pending order status
          subtotal: totalAmount,
          tax: 0,
          total: totalAmount,
          comments: orderNotes || '',
        }

        // Store order data in localStorage for PayPal success page
        localStorage.setItem('pendingPayPalOrder', JSON.stringify(orderData))

        // Call PayPal payment processing API - use uppercase 'PAYPAL' to match backend enum
        const response = await api.post('/payments/process/PAYPAL', {
          orderId: tempOrderId, // Temporary order ID
          amount: totalAmount,
          currency: 'USD',
          userId: user._id,
          paymentMethodId: paypalMethodId,
          products: displayItems,
          total: totalAmount,
        })

        // The URL is directly in the response object, not in response.data
        const paypalUrl = response.url

        if (paypalUrl) {
          console.log('🔗 Redirecting to PayPal:', paypalUrl)
          window.location.href = paypalUrl
          return // Don't proceed to onContinue for PayPal
        } else {
          console.error('Full response:', response)
          alert('PayPal redirect URL not received. Please try again.')
        }
      } catch (error) {
        console.error('Error details:', error.response?.data || error.message)
        // Show error message to user
        alert(
          'Failed to process PayPal payment: ' +
            (error.response?.data?.message || error.message),
        )
        return // Don't proceed to onContinue on error
      }
    } else {
      console.log('❌ PayPal not selected, current method:', paymentMethod)
    }

    // Find the payment method ID based on the selected payment method type
    const selectedPaymentMethodId = paymentMethods.find(
      (m) => m.type?.toLowerCase() === paymentMethod.toLowerCase(),
    )?._id

    onContinue(
      {
        paymentMethod: selectedPaymentMethodId, // Send the ID instead of string
        orderNotes,
      },
      'placeOrder',
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold uppercase mb-6">Order Detail</h2>

        {/* Order Items */}
        <div className="space-y-4 mb-8">
          {displayItems.map((item) => (
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
                  {item.color && (
                    <div className="text-sm text-gray-600">
                      Color: {item.color}
                    </div>
                  )}
                  {item.size && (
                    <div className="text-sm text-gray-600">
                      Size: {item.size}
                    </div>
                  )}
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">
                        Qty: {item.quantity || 1}
                      </span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹
                        {(
                          (item.price || 0) * (item.quantity || 1)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Edit/Delete Buttons */}
                  {!directCheckoutItem && (
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
                  )}
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

          {loadingPaymentMethods ? (
            <div className="text-sm text-gray-600">
              Loading payment methods...
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method._id} className="flex items-center">
                  <input
                    id={method.type?.toLowerCase()}
                    name="payment-method"
                    type="radio"
                    className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] border-gray-300"
                    checked={paymentMethod === method.type?.toLowerCase()}
                    onChange={() => {
                      console.log(
                        'Payment method selected:',
                        method.type?.toLowerCase(),
                      )
                      setPaymentMethod(method.type?.toLowerCase())
                    }}
                  />
                  <label
                    htmlFor={method.type?.toLowerCase()}
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    {method.name}
                  </label>
                </div>
              ))}

              {paymentMethods.length === 0 && (
                <div className="text-sm text-gray-600">
                  No payment methods available
                </div>
              )}
            </div>
          )}
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

      <ConfirmationModal
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteItem}
        title="Remove Item"
        description="Are you sure you want to remove this item from your cart?"
        confirmText="Remove Item"
        theme="error"
      />
    </form>
  )
}
