'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createOrder, resetOrderState } from '@/features/order/orderSlice'
import AuthModal from '@/components/Auth/AuthModal'
import CheckoutSteps from './components/CheckoutSteps'
import OrderSummary from './components/OrderSummary'
import ShippingAddress from './components/ShippingAddress'
import ShippingMethods from './components/ShippingMethods'
import OrderDetail from './components/OrderDetail'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    shippingAddress: {},
    shippingMethod: {},
    paymentMethod: 'cod',
    orderNotes: '',
  })
  const [outOfStockError, setOutOfStockError] = useState(null)

  // Get order state from Redux
  const { order, loading, error, success } = useSelector((state) => state.order)

  // Check authentication on component mount and when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (!user || !token) {
        const timer = setTimeout(() => setShowAuthModal(true), 0)
        return () => clearTimeout(timer)
      }
    }
  }, [user])

  // Handle order submission
  useEffect(() => {
    if (success && order) {
      clearCart()
      dispatch(resetOrderState())

      // Force navigation to orders page
      window.location.href = '/orders'
    }
  }, [success, order, clearCart, dispatch])

  const handleContinue = async (stepData, nextStep) => {
    // If this is the final step (place order)
    if (nextStep === 'placeOrder') {
      try {
        // Verify user and token again before proceeding
        const token = localStorage.getItem('token')
        if (!user || !token) {
          setShowAuthModal(true)
          return
        }

        if (!formData.shippingAddress?._id) {
          return
        }

        // Prepare order data
        const orderData = {
          user: user?._id,
          shippingMethod: formData.shippingMethod?._id,
          shippingCost: formData.shippingMethod?.price || 0,
          shippingAddressId: formData.shippingAddress._id,
          products: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod: formData.paymentMethod,
          paymentStatus:
            formData.paymentMethod === 'cod' ? 'pending' : 'completed',
          orderStatus: 'pending',
          subtotal: cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          tax: 0,
          total:
            cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
            (formData.shippingMethod?.price || 0),
          comments: formData.orderNotes || '',
        }

        // Dispatch the createOrder action
        const result = await dispatch(createOrder(orderData))

        if (createOrder.rejected.match(result)) {
          const error =
            result.error?.message || result.payload || 'Failed to place order'

          // Handle out of stock error
          if (
            error.includes('Insufficient stock') ||
            result.payload?.includes('Insufficient stock')
          ) {
            const productId = error.match(/product\s+(\w+)$/i)?.[1]
            setOutOfStockError(productId || 'one or more products')
          }
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          // Clear invalid token and show auth modal
          localStorage.removeItem('token')
          setShowAuthModal(true)
        }
      }
      return
    }

    // For non-final steps
    setFormData((prev) => ({
      ...prev,
      ...stepData,
    }))

    const targetStep = nextStep || currentStep + 1
    setCurrentStep(targetStep)
    window.scrollTo(0, 0)
  }

  const handleStepClick = (stepNumber) => {
    // Only allow navigation to previous steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ShippingAddress
            onContinue={handleContinue}
            initialData={formData.shippingAddress}
          />
        )
      case 2:
        return (
          <ShippingMethods
            onContinue={handleContinue}
            initialMethod={formData.shippingMethod}
          />
        )
      case 3:
        return (
          <OrderDetail
            onContinue={handleContinue}
            paymentMethod={formData.paymentMethod}
          />
        )
      default:
        return <ShippingAddress onContinue={handleContinue} />
    }
  }

  // Redirect to home if cart is empty
  if (cart.length === 0) {
    router.push('/')
    return null
  }

  // Calculate order total
  const orderTotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => !user && router.push('/')} // Redirect to home if user closes without logging in
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold uppercase mb-8">CHECKOUT</h1>

        <CheckoutSteps
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
        {outOfStockError ? (
          <div className="text-red-500 text-sm text-center p-4 bg-red-50 rounded border border-red-200 mb-4">
            <p className="font-medium">Out of Stock</p>
            <p>
              Sorry, there&apos;s insufficient stock for one or more items in
              your cart.
            </p>
            <button
              onClick={() => router.push('/cart')}
              className="mt-2 text-blue-600 hover:underline"
            >
              Update Cart
            </button>
          </div>
        ) : (
          error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
              {error}
            </div>
          )
        )}
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="lg:w-2/3">{renderStep()}</div>

          <div className="lg:w-1/3">
            <OrderSummary
              cartItems={cart}
              shippingMethod={formData.shippingMethod}
              orderTotal={orderTotal}
              currentStep={currentStep}
              onContinue={handleContinue}
              isLoading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
