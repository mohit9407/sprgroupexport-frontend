import { useState } from 'react'

export default function ShippingMethods({ onContinue, initialMethod = '' }) {
  const [selectedMethod, setSelectedMethod] = useState(initialMethod)

  const shippingOptions = [
    {
      id: 'flat-rate',
      label: 'Flat Rate',
      price: '₹0',
      description: 'Standard delivery',
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    onContinue(
      {
        shippingMethod: selectedMethod,
      },
      4,
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold uppercase mb-2">Shipping Methods</h2>
      <p className="text-sm text-gray-600 mb-6">
        Please select the preferred shipping method to use on this order.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">FLAT RATE</h3>
          </div>

          <div className="p-4">
            {shippingOptions.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  id={option.id}
                  name="shipping-method"
                  type="radio"
                  className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] border-gray-300"
                  checked={selectedMethod === option.id}
                  onChange={() => setSelectedMethod(option.id)}
                  required
                />
                <label htmlFor={option.id} className="ml-3 flex items-center">
                  <span className="block text-sm font-medium text-gray-700">
                    {option.label} --- {option.price}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium hover:bg-[#b38950] transition-colors"
            disabled={!selectedMethod}
          >
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  )
}
