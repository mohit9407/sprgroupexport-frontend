import React from 'react'

const steps = [
  'Shipping Address',
  'Billing Address',
  'Shipping Methods',
  'Order Detail',
]

const ArrowRight = ({ isActive }) => (
  <div className="relative w-6 h-6 mx-1">
    <div
      className={`absolute top-1/2 left-0 w-0 h-0 border-t-4 border-b-4 border-t-transparent border-b-transparent ${
        isActive ? 'border-l-[#c89b5a]' : 'border-l-gray-200'
      } border-l-6`}
    ></div>
  </div>
)

export default function CheckoutSteps({ currentStep = 1, onStepClick }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <React.Fragment key={step}>
            <div
              className={`flex items-center ${isCompleted || isActive ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() =>
                (isCompleted || isActive) && onStepClick(stepNumber)
              }
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    isActive
                      ? 'bg-[#c89b5a] text-white'
                      : isCompleted
                        ? 'bg-[#c89b5a] text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
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
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`ml-2 text-sm ${isActive || isCompleted ? 'text-[#c89b5a] font-medium' : 'text-gray-500'}`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && <ArrowRight isActive={isCompleted} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}
