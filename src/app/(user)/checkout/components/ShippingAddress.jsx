import { useState } from 'react'

export default function ShippingAddress({ onContinue, initialData = {} }) {
  const [selectedAddress, setSelectedAddress] = useState('existing')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onContinue(
      {
        shippingAddress: {
          // Add form data here
        },
      },
      2,
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold uppercase mb-6">
        SELECT EXISTING ADDRESS
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex items-center">
          <input
            type="radio"
            id="existing-address"
            name="address-type"
            className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a]"
            checked={!showNewAddressForm}
            onChange={() => setShowNewAddressForm(false)}
          />
          <label
            htmlFor="existing-address"
            className="ml-2 text-sm text-gray-700"
          >
            asdasda, dasadsaa, asdadas, montrial, , Cyprus, 1324344
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="radio"
            id="new-address"
            name="address-type"
            className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a]"
            checked={showNewAddressForm}
            onChange={() => setShowNewAddressForm(true)}
          />
          <label htmlFor="new-address" className="ml-2 text-sm text-gray-700">
            Add New Address
          </label>
        </div>
      </div>

      {showNewAddressForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
                placeholder="Enter Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              placeholder="Enter Your Address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100">
                <option>Select Country</option>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100">
                <option>Select State</option>
                <option>Maharashtra</option>
                <option>Delhi</option>
                <option>Karnataka</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
                placeholder="Enter Your City"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip / Postal Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
                placeholder="Enter Your Zip / Postal Code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
                placeholder="Enter Your Phone Number"
                value="1231131313"
              />
            </div>
          </div>
        </form>
      )}

      <div className="mt-8">
        <button
          onClick={() => onContinue({}, 2)}
          className="bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium hover:bg-[#b38950] transition-colors"
        >
          CONTINUE
        </button>
      </div>
    </div>
  )
}
