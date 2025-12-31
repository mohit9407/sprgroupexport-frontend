import React from 'react'

const steps = [
  { id: 1, label: 'Shipping Address' },
  { id: 2, label: 'Shipping Methods' },
  { id: 3, label: 'Order Detail' },
]

const ArrowRight = ({ isActive }) => (
  <svg
    className={`w-4 h-4 mx-12 ${isActive ? 'text-[#c89b5a]' : 'text-gray-300'}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
)

export default function CheckoutSteps({ currentStep = 2, onStepClick }) {
  return (
    <div className="py-6">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isFuture = step.id > currentStep
          const isClickable = isCompleted || isActive

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex flex-col items-center mx-2 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() =>
                  isClickable && onStepClick && onStepClick(step.id)
                }
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      isActive
                        ? 'bg-[#c89b5a] text-white border-2 border-[#c89b5a]'
                        : isCompleted
                          ? 'bg-[#c89b5a] text-white border-2 border-[#c89b5a]'
                          : 'bg-white text-gray-400 border-2 border-gray-300'
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
                    step.id
                  )}
                </div>
                <span
                  className={`mt-2 text-sm whitespace-nowrap ${
                    isActive || isCompleted
                      ? 'text-[#c89b5a] font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <ArrowRight isActive={isCompleted} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
