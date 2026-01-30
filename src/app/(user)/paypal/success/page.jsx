'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/axios'
import { toast } from 'react-hot-toast'

export default function PayPalSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Processing your PayPal payment...')
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (isProcessingRef.current) return

    const processPayPalPayment = async () => {
      isProcessingRef.current = true
      const token = searchParams.get('token')
      const payerId = searchParams.get('PayerID')

      if (!token || !payerId) {
        setStatus('error')
        setMessage('Invalid PayPal response. Missing required parameters.')
        return
      }

      try {
        console.log('Processing PayPal success:', { token, payerId })

        // Get stored order data from localStorage (set during checkout)
        const storedOrderData = localStorage.getItem('pendingPayPalOrder')
        if (!storedOrderData) {
          throw new Error('Order data not found')
        }

        // Get PayPal order ID from URL token (this is the PayPal order ID)
        const paypalOrderId = token
        console.log('PayPal order ID from token:', paypalOrderId)

        const orderData = JSON.parse(storedOrderData)
        console.log('Creating order with data:', orderData)

        // Add PayPal order ID to order data
        orderData.paymentProviderOrderId = paypalOrderId
        console.log(
          'Order data with PayPal ID:',
          JSON.stringify(orderData, null, 2),
        )

        // Create the actual order in database
        const orderResponse = await api.post('/orders/create', orderData)
        console.log('Order created successfully:', orderResponse.data)
        const createdOrder = orderResponse.data

        // Check if paymentProviderOrderId was saved
        console.log(
          'Created order paymentProviderOrderId:',
          createdOrder.paymentProviderOrderId,
        )

        toast.success(
          `Order #${createdOrder._id.slice(-6)} created successfully! Payment received.`,
        )

        // Now capture the PayPal payment using the PayPal order ID (not our order ID)
        console.log(
          'Capturing PayPal payment with PayPal order ID:',
          paypalOrderId,
        )
        try {
          const captureResponse = await api.post(
            `/payments/capture/paypal/${paypalOrderId}`,
            {
              token,
              payerId,
            },
          )
          console.log(
            'PayPal payment captured successfully:',
            captureResponse.data,
          )
          console.log('Capture response status:', captureResponse.data?.success)
        } catch (captureError) {
          console.error('PayPal capture failed:', captureError)
          console.error('Capture error details:', captureError.response?.data)
          // Don't fail the whole process if capture fails - order is already created
          console.log(
            'Order created but PayPal capture failed - user paid but system error',
          )
        }

        // Clear stored order data
        localStorage.removeItem('pendingPayPalOrder')

        setStatus('success')
        setMessage(
          'Payment successful! Order created. Redirecting to your orders...',
        )

        // Redirect to orders page after 2 seconds
        setTimeout(() => {
          router.push('/orders')
        }, 2000)
      } catch (error) {
        console.error('PayPal order creation failed:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        console.error(
          'Error details:',
          error.response?.data?.message || error.message,
        )

        // Show error notification
        toast.error('Order creation failed. Please contact support.')

        setStatus('error')
        setMessage(
          'Order creation failed. Please contact support with your PayPal transaction ID.',
        )

        // Redirect to orders page after 5 seconds even on error
        setTimeout(() => {
          router.push('/orders')
        }, 5000)
      }
    }

    processPayPalPayment()
  }, [searchParams, router]) // Only depend on searchParams and router

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c89b5a] mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Payment
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
