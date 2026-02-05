import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { paymentService } from '@/services/paymentService'
import { api } from '@/lib/axios'
import { toast } from '@/utils/toastConfig'

export default function OrderDetail({
  onContinue,
  paymentMethod: initialPaymentMethod = 'cod',
  directCheckoutItem = null,
  isLoading,
  shippingAddress,
  shippingMethod,
}) {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod)
  const [paymentError, setPaymentError] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)

  // Use directCheckoutItem if available, otherwise use cart
  const displayItems = directCheckoutItem ? [directCheckoutItem] : cart

  const shippingCost = Number(shippingMethod?.price) || 0

  // Calculate order total
  const orderTotal =
    displayItems.reduce((total, item) => {
      return total + item.price * (item.quantity || 1)
    }, 0) + shippingCost

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
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
    if (paymentError) setPaymentError('')
    // Notify parent component about the payment method change
    onContinue({ paymentMethod: method }, null, true)
  }

  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject('Window is undefined')

      const existingScript = document.getElementById('razorpay-script')
      if (existingScript) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.id = 'razorpay-script'
      script.onload = () => resolve(true)
      script.onerror = () => reject(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.() // Safely call preventDefault if e exists

    // Validate payment method is selected
    if (!paymentMethod) {
      setPaymentError(
        'Please select a payment method before placing your order',
      )
      return
    }
    setPaymentError('')

    // If PayPal is selected, process payment and redirect
    if (paymentMethod === 'paypal') {
      try {
        const shippingCost = Number(shippingMethod?.price) || 0

        const totalAmount =
          displayItems.reduce((total, item) => {
            return total + item.price * (item.quantity || 1)
          }, 0) + shippingCost

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

        const tempOrderId = 'temp_' + Date.now()
        const user = JSON.parse(localStorage.getItem('user'))

        // Prepare order data to be stored for later creation after PayPal success

        const orderData = {
          user: user._id,
          shippingMethod: shippingMethod._id,
          shippingCost: shippingMethod.price || 0,
          shippingAddressId: shippingAddress.shippingAddress._id,
          products: displayItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity || 1,
          })),
          paymentMethod: paypalMethodId, // PayPal payment method ID
          paymentStatus: '695e0471c424c92fee37713b', // Pending status
          orderStatus: '693fea47bb389dcda0118800', // Pending order status
          subtotal: totalAmount - shippingCost,
          total: totalAmount,
          tax: 0,
          comments: orderNotes || '',
        }

        // Store order data in localStorage for PayPal success page
        localStorage.setItem('pendingPayPalOrder', JSON.stringify(orderData))

        // Call PayPal payment processing API - use uppercase 'PAYPAL' to match backend enum
        const response = await api.post('/payments/process/PAYPAL', {
          orderId: tempOrderId, // Temporary order ID
          amount: totalAmount,
          currency: 'INR',
          userId: user._id,
          paymentMethodId: paypalMethodId,
          products: displayItems,
          total: totalAmount,
        })

        // The URL is directly in the response object, not in response.data
        const paypalUrl = response.url

        if (paypalUrl) {
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
      console.log('Selected current method:', paymentMethod)
    }

    if (paymentMethod === 'razorpay') {
      try {
        await loadRazorpayScript()

        const user = JSON.parse(localStorage.getItem('user'))

        const shippingCost = Number(shippingMethod?.price) || 0

        const totalAmount =
          displayItems.reduce((total, item) => {
            return total + item.price * (item.quantity || 1)
          }, 0) + shippingCost

        const response = await api.post('/payments/process/RAZORPAY', {
          amount: totalAmount,
          currency: 'INR',
          userId: user._id,
        })

        const { orderId, currency, keyId } = response
        const amountInPaise = Math.round(totalAmount * 100)

        const options = {
          key: keyId,
          amount: amountInPaise,
          currency,
          order_id: orderId,
          name: 'SPR Group Export',
          description: 'Order Payment',
          handler: async (razorpayResponse) => {
            const verifyRes = await api.post('/payments/verify/razorpay', {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            })

            if (verifyRes?.success) {
              toast.success('Payment successful! Order placed 🎉')
              const selectedPaymentMethodId = paymentMethods.find(
                (m) => m.type?.toLowerCase() === 'razorpay',
              )?._id

              onContinue(
                {
                  paymentMethod: selectedPaymentMethodId,
                  paymentProviderOrderId: razorpayResponse.razorpay_payment_id,
                  paymentStatus: '695e0495c424c92fee377141',
                  orderNotes,
                },
                'placeOrder',
              )
            } else {
              alert('Payment verification failed!')
            }
          },
          prefill: {
            name: user.name || '',
            email: user.email || '',
            contact: '8141529030',
          },
          theme: { color: '#c89b5a' },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (error) {
        console.error('Razorpay error:', error)
        alert('Failed to initiate Razorpay payment.')
      }

      return
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
                      src={item.image.thumbnailUrl}
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
          {paymentError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Payment Method Required</p>
              <p className="text-sm">{paymentError}</p>
            </div>
          )}

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
                      handlePaymentMethodChange(method.type?.toLowerCase())
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
            disabled={isLoading}
            className={`bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium hover:bg-[#b38950] transition-colors flex items-center justify-center min-w-[180px] ${isLoading ? 'opacity-90' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>PLACING ORDER...</span>
              </div>
            ) : (
              'PLACE ORDER'
            )}
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
