'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/axios'
import { toast } from '@/utils/toastConfig'

export default function RazorpaySuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Processing your Razorpay payment...')
  // const processingRef = useRef(false)

  useEffect(() => {
    if (window.__razorpayProcessing) return
    window.__razorpayProcessing = true

    const razorpayPaymentId = searchParams.get('razorpay_payment_id')
    const processedKey = razorpayPaymentId
      ? `razorpay_processed_${razorpayPaymentId}`
      : null
    if (processedKey && sessionStorage.getItem(processedKey)) {
      console.log('Order already processed, redirecting...')
      setStatus('success')
      setMessage('Order already created. Redirecting...')
      setTimeout(() => {
        router.push('/orders')
      }, 1500)
      return
    }

    const processRazorpayPayment = async () => {
      if (razorpayPaymentId && sessionStorage.getItem(processedKey)) {
        console.log('Payment already processed (inside async), skipping...')
        return
      }

      // Get Razorpay payment details from URL
      const razorpayOrderId = searchParams.get('razorpay_order_id')
      const razorpaySignature = searchParams.get('razorpay_signature')

      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        setStatus('error')
        setMessage('Invalid Razorpay response. Missing required parameters.')
        return
      }

      try {
        const storedOrderData = localStorage.getItem('pendingRazorpayOrder')
        if (!storedOrderData) {
          throw new Error('Order data not found')
        }

        const storedData = JSON.parse(storedOrderData)

        const verifyRes = await api.post('/payments/verify/razorpay', {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        })

        if (!verifyRes?.success) {
          throw new Error('Payment verification failed')
        }

        const products = storedData.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          attributes: {
            color: item.color || null,
            size: item.size || null,
          },
        }))

        const subtotal = storedData.items.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0,
        )
        const shippingCost = Number(storedData.shippingMethod?.price || 0)
        const total = subtotal + shippingCost

        const orderData = {
          user: storedData.userId,
          shippingMethod: storedData.shippingMethod?._id,
          shippingCost: shippingCost,
          shippingAddressId: storedData.shippingAddress?._id,
          products: products,
          paymentMethod: storedData.paymentMethod,
          paymentStatus: '695e0495c424c92fee377141',
          paymentProviderOrderId: razorpayPaymentId,
          orderStatus: storedData.pendingStatusId,
          subtotal: subtotal,
          discount: 0,
          tax: 0,
          total: total,
          discountReason: null,
          comments: storedData.orderNotes || '',
        }

        if (processedKey) {
          sessionStorage.setItem(processedKey, 'true')
        }

        const orderResponse = await api.post('/orders/create', orderData)

        const createdOrder = orderResponse.data

        toast.success(
          `Order #${createdOrder._id.slice(-6)} created successfully! Payment received. 🎉`,
        )

        localStorage.removeItem('pendingRazorpayOrder')

        setStatus('success')
        setMessage(
          'Payment successful! Order created. Redirecting to your orders...',
        )

        setTimeout(() => {
          router.push('/orders')
        }, 2000)
      } catch (error) {
        if (razorpayPaymentId && sessionStorage.getItem(processedKey)) {
          console.log(
            'Error caught but order already processed, skipping error toast',
          )
          return
        }

        setStatus('error')

        setTimeout(() => {
          router.push('/orders')
        }, 5000)
      }
    }

    processRazorpayPayment()
  }, [])

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
