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
import { toast } from '@/utils/toastConfig'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { cart, clearCart, directCheckoutItem, clearDirectCheckoutItem } =
    useCart()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isCheckingDirectCheckout, setIsCheckingDirectCheckout] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    shippingAddress: {},
    shippingMethod: {},
    paymentMethod: '',
    orderNotes: '',
  })
  const [outOfStockError, setOutOfStockError] = useState(null)
  const [addressError, setAddressError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const { userOrders = [] } = useSelector((state) => state.order || {})

  // Get order and order status state from Redux
  const { order, loading, error, success } = useSelector((state) => state.order)
  const { statuses } = useSelector((state) => state.orderStatus)

  // Handle direct checkout and authentication
  useEffect(() => {
    const checkAuthAndDirectCheckout = async () => {
      try {
        if (typeof window === 'undefined') {
          return
        }

        // Check authentication first
        const token = localStorage.getItem('accessToken')
        if (!user || !token) {
          router.push('/cart')
          return
        }

        // If no direct checkout item and cart is empty, redirect to cart
        if (!directCheckoutItem && (!cart || cart.length === 0)) {
          router.push('/cart')
          return
        }
      } catch (error) {
        console.error('Error in checkout flow:', error)
        router.push('/cart')
      } finally {
        setIsCheckingDirectCheckout(false)
      }
    }

    checkAuthAndDirectCheckout()
  }, [user, cart, directCheckoutItem, router])

  // Fetch order statuses on component mount
  useEffect(() => {
    dispatch(fetchOrderStatuses())
  }, [dispatch])

  // Handle order submission
  // useEffect(() => {
  //   if (success && order) {
  //     clearCart()
  //     dispatch(resetOrderState())

  //     // Force navigation to orders page
  //     window.location.href = '/orders'
  //   }
  // }, [success, order, clearCart, dispatch])

  const handleContinue = async (stepData, nextStep, skipStepUpdate = false) => {
    // If nextStep is explicitly provided and not null, update the step
    if (typeof nextStep === 'number' || nextStep === null) {
      setFormData((prev) => {
        // If stepData has shippingAddress, handle it specially
        if (stepData.shippingAddress) {
          return {
            ...prev,
            shippingAddress: stepData.shippingAddress,
            ...Object.fromEntries(
              Object.entries(stepData).filter(
                ([key]) => key !== 'shippingAddress',
              ),
            ),
          }
        }
        // Otherwise merge with existing data
        return {
          ...prev,
          ...stepData,
        }
      })

      // Only update step if nextStep is a number and we're not skipping the update
      if (typeof nextStep === 'number' && !skipStepUpdate) {
        setCurrentStep(nextStep)
        window.scrollTo(0, 0)
      }
      return
    }

    // If this is the final step (place order)
    if (nextStep === 'placeOrder') {
      // Merge current form data with step data
      const currentFormData = {
        ...formData,
        ...stepData,
      }
      // Validate address is selected
      if (
        !currentFormData?.shippingAddress ||
        !currentFormData.shippingAddress._id
      ) {
        setAddressError(
          'Please select a shipping address before placing your order',
        )
        setCurrentStep(1) // Go back to address selection step
        return
      }

      // Validate payment method is selected
      if (!currentFormData.paymentMethod) {
        setPaymentError(
          'Please select a payment method before placing your order',
        )
        setCurrentStep(3) // Go back to payment method selection step
        return
      }

      // Clear any previous errors
      setAddressError('')
      setPaymentError('')

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
        const token =
          localStorage.getItem('accessToken') || localStorage.getItem('token')
        if (!user || !token) {
          setShowAuthModal(true)
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
          ? [
              {
                productId: directCheckoutItem.id,
                quantity: directCheckoutItem.quantity,
                color: directCheckoutItem.colorId,
                size: directCheckoutItem.sizeId,
              },
            ]
          : cart.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              color: item.colorId,
              size: item.sizeId,
            }))

        // Calculate subtotal based on directCheckoutItem or cart
        const displayItemsForSubtotal = directCheckoutItem
          ? [directCheckoutItem]
          : cart
        const subtotal = displayItemsForSubtotal.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        )

        // Prepare order data
        const shippingCost = Number(formData.shippingMethod?.price || 0)

        // Calculate first order discount (5% of subtotal)
        const isFirstOrder = userOrders?.length === 0
        const discount = isFirstOrder ? Math.round(subtotal * 0.05) : 0
        const total = subtotal + shippingCost - discount

        const orderData = {
          user: user?._id,
          shippingMethod: formData.shippingMethod?._id,
          shippingCost: formData.shippingMethod?.price || 0,
          shippingAddressId: formData.shippingAddress?._id,
          products: products,
          paymentMethod: stepData.paymentMethod, // Use payment method from OrderDetail instead of formData
          paymentStatus: stepData.paymentStatus || '695e0471c424c92fee37713b',
          paymentProviderOrderId: stepData.paymentProviderOrderId || null,
          orderStatus: pendingStatus._id,
          subtotal: subtotal,
          discount: discount,
          tax: 0,
          total: total,
          discountReason: isFirstOrder ? 'first_order_5_percent' : null,
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

        if (createOrder.fulfilled.match(result)) {
          console.log('Order created successfully:', result.payload)

          toast.success('Order created successfully! 🎉')

          clearCart()

          // ⏳ wait for toast to mount
          setTimeout(() => {
            dispatch(resetOrderState())
            router.push('/orders')
          }, 1200)
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
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        ...stepData,
      }

      // Store shipping address in localStorage if it's being set
      if (stepData.shippingAddress && stepData.shippingAddress._id) {
        localStorage.setItem(
          'selectedShippingAddress',
          JSON.stringify(stepData.shippingAddress._id),
        )
      }

      // Store shipping method in localStorage if it's being set
      if (stepData.shippingMethod && stepData.shippingMethod._id) {
        localStorage.setItem(
          'selectedShippingMethod',
          JSON.stringify(stepData.shippingMethod),
        )
      }

      return updatedFormData
    })

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
          <div>
            {addressError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {addressError}
              </div>
            )}
            <ShippingAddress
              onContinue={(data, nextStep) => {
                setAddressError('')
                setFormData((prev) => ({
                  ...prev,
                  shippingAddress: data.shippingAddress,
                }))
                if (typeof nextStep === 'number') {
                  setCurrentStep(nextStep)
                }
              }}
              initialData={formData.shippingAddress}
            />
          </div>
        )
      case 2:
        return (
          <ShippingMethods
            onContinue={(data, step) => {
              handleContinue(data, step)
            }}
            initialMethod={formData.shippingMethod}
            shippingAddress={formData.shippingAddress}
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
            shippingMethod={formData.shippingMethod}
            shippingAddress={formData.shippingAddress}
            isLoading={loading}
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
  const orderTotal =
    displayItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0) + Number(formData.shippingMethod?.price || 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          !user && router.push('/')
        }} // Redirect to home if user closes without logging in
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
              error={error || paymentError}
              paymentMethod={formData.paymentMethod}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
