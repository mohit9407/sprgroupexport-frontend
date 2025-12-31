'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import AuthModal from '@/components/Auth/AuthModal'
import CheckoutSteps from './components/CheckoutSteps'
import OrderSummary from './components/OrderSummary'
import ShippingAddress from './components/ShippingAddress'
import ShippingMethods from './components/ShippingMethods'
import OrderDetail from './components/OrderDetail'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { cart } = useCart()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    shippingAddress: {},
    shippingMethod: '',
    paymentMethod: 'cod',
  })

  // Check authentication on component mount and when user changes
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setShowAuthModal(true), 0)
      return () => clearTimeout(timer)
    }
  }, [user])

  const handleContinue = (stepData, nextStep) => {
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

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="lg:w-2/3">{renderStep()}</div>

          <div className="lg:w-1/3">
            <OrderSummary
              cartItems={cart}
              shippingMethod={formData.shippingMethod}
              orderTotal={orderTotal}
              currentStep={currentStep}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
