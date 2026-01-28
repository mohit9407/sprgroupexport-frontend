'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createOrder, resetOrderState } from '@/features/order/orderSlice'
import { fetchOrderStatuses } from '@/features/orderStatus/orderStatusSlice'
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
  const { cart, clearCart, addToCart } = useCart()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isCheckingDirectCheckout, setIsCheckingDirectCheckout] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [directCheckoutItem, setDirectCheckoutItem] = useState(null)
  const [formData, setFormData] = useState({
    shippingAddress: {},
    shippingMethod: {},
    paymentMethod: '695cae5421d3f5118b0c8c91',
    orderNotes: '',
  })
  const [outOfStockError, setOutOfStockError] = useState(null)

  // Get order and order status state from Redux
  const { order, loading, error, success } = useSelector((state) => state.order)
  const { statuses } = useSelector((state) => state.orderStatus)

  // Handle direct checkout and authentication
  useEffect(() => {
    const checkAuthAndDirectCheckout = async () => {
      // Check for direct checkout item first
      if (typeof window !== 'undefined') {
        const directCheckoutItem = sessionStorage.getItem('directCheckoutItem')
        
        if (directCheckoutItem) {
          try {
            const item = JSON.parse(directCheckoutItem)
            // Clear the direct checkout item from storage
            sessionStorage.removeItem('directCheckoutItem')
            
            // Set the direct checkout item in state
            setDirectCheckoutItem({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              color: item.color,
              colorId: item.colorId,
              size: item.size,
              sizeId: item.sizeId,
              quantity: item.quantity || 1,
              inStock: true
            })
          } catch (error) {
            console.error('Error processing direct checkout:', error)
          }
        }
        
        // Check authentication
        const token = localStorage.getItem('token')
        if (!user || !token) {
          setShowAuthModal(true)
        }
      }
      
      setIsCheckingDirectCheckout(false)
    }
    
    checkAuthAndDirectCheckout()
  }, [user])

  // Fetch order statuses on component mount
  useEffect(() => {
    dispatch(fetchOrderStatuses())
  }, [dispatch])

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
      // Check if statuses are loaded
      if (!statuses || statuses.length === 0) {
        try {
          await dispatch(fetchOrderStatuses()).unwrap()
          // After fetching, try again
          return handleContinue(stepData, nextStep)
        } catch (error) {
          return
        }
      }

      try {
        // Verify user and token again before proceeding
        const token = localStorage.getItem('token')
        if (!user || !token) {
          setShowAuthModal(true)
          return
        }

        if (!formData.shippingAddress?._id) {
          console.error('Shipping address is required')
          return
        }

        // Get the pending status ID
        const pendingStatus = statuses.find(
          (status) => status.orderStatus?.toLowerCase() === 'pending',
        )

        if (!pendingStatus?._id) {
          return
        }

        // Prepare products array based on direct checkout or cart
        const products = directCheckoutItem 
          ? [{
              productId: directCheckoutItem.id,
              quantity: directCheckoutItem.quantity,
              color: directCheckoutItem.colorId,
              size: directCheckoutItem.sizeId
            }]
          : cart.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              color: item.colorId,
              size: item.sizeId
            }));

        // Calculate subtotal based on displayItems
        const subtotal = displayItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        )

        // Prepare order data
        const orderData = {
          user: user?._id,
          shippingMethod: formData.shippingMethod?._id,
          shippingCost: formData.shippingMethod?.price || 0,
          shippingAddressId: formData.shippingAddress._id,
          products: products,
          paymentMethod: formData.paymentMethod,
          paymentStatus: '695e0471c424c92fee37713b',
          orderStatus: pendingStatus._id,
          subtotal: subtotal,
          tax: 0,
          total: subtotal + (formData.shippingMethod?.price || 0),
          comments: stepData.orderNotes || '',
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
            onContinue={(data, step) => {
              handleContinue(data, step)
            }}
            initialData={formData.shippingAddress}
          />
        )
      case 2:
        return (
          <ShippingMethods
            onContinue={(data, step) => {
              handleContinue(data, step)
            }}
            initialMethod={formData.shippingMethod}
          />
        )
      case 3:
        return (
          <OrderDetail
            onContinue={(data, step) => {
              handleContinue(data, step)
            }}
            paymentMethod={formData.paymentMethod}
            directCheckoutItem={directCheckoutItem}
          />
        )
      default:
        return <ShippingAddress onContinue={handleContinue} />
    }
  }

  // Don't render anything while checking for direct checkout
  if (isCheckingDirectCheckout) {
    return null
  }
  
  // Redirect to home if cart is empty and no direct checkout item
  if (cart.length === 0 && !directCheckoutItem) {
    router.push('/')
    return null
  }

  // Calculate order total
  const displayItems = directCheckoutItem ? [directCheckoutItem] : cart
  const orderTotal = displayItems.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0) + (formData.shippingMethod?.price || 0)

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
              cartItems={displayItems}
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
