'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import CheckoutSteps from './components/CheckoutSteps'
import OrderSummary from './components/OrderSummary'
import ShippingAddress from './components/ShippingAddress'
import BillingAddress from './components/BillingAddress'
import ShippingMethods from './components/ShippingMethods'
import OrderDetail from './components/OrderDetail'

export default function CheckoutPage() {
  const { cart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    shippingAddress: {},
    billingAddress: {},
    shippingMethod: '',
    paymentMethod: 'cod',
  })

  const handleContinue = (stepData, nextStep) => {
    setFormData((prev) => ({
      ...prev,
      ...stepData,
    }))
    setCurrentStep(nextStep)
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
          <BillingAddress
            onContinue={handleContinue}
            initialData={formData.billingAddress}
          />
        )
      case 3:
        return (
          <ShippingMethods
            onContinue={handleContinue}
            initialMethod={formData.shippingMethod}
          />
        )
      case 4:
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold uppercase mb-8">CHECKOUT</h1>

        <CheckoutSteps
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="lg:w-2/3">{renderStep()}</div>

          <div className="lg:w-1/3">
            <OrderSummary cartItems={cart} />
          </div>
        </div>
      </div>
    </div>
  )
}
