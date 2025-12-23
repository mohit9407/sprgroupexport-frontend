import { useState } from 'react'

export default function BillingAddress({ onContinue, initialData = {} }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    phone: '',
    sameAsShipping: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onContinue(
      {
        billingAddress: formData,
      },
      3,
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold uppercase mb-6">Billing Address</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              placeholder="Enter Your Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              placeholder="Last Name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
            placeholder="Enter Your Address"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              required
            >
              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              required
            >
              <option value="">Select State</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              placeholder="Enter Your City"
              required
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
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              placeholder="Enter Your Zip / Postal Code"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c89b5a] focus:border-[#c89b5a] bg-gray-100"
              placeholder="Enter Your Phone Number"
              required
            />
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="sameAsShipping"
            name="sameAsShipping"
            checked={formData.sameAsShipping}
            onChange={handleChange}
            className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] border-gray-300 rounded"
          />
          <label
            htmlFor="sameAsShipping"
            className="ml-2 block text-sm text-gray-700"
          >
            Same shipping and billing address.
          </label>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium hover:bg-[#b38950] transition-colors"
          >
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  )
}
