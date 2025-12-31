'use client'

import { FaMapMarkerAlt } from 'react-icons/fa'

export default function AddressForm({
  formData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
  isEditing,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            placeholder="Full Name"
            required
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            placeholder="Mobile Number"
            required
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit mobile number"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
              placeholder="Street Address"
              required
            />
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            placeholder="City"
            required
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            placeholder="State/Province"
            required
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PIN Code
          </label>
          <input
            type="text"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            placeholder="Postal/ZIP Code"
            required
          />
        </div>

        <div className="col-span-2 flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-[#BA8B4E] focus:ring-[#BA8B4E] border-gray-300 rounded"
          />
          <label
            htmlFor="isDefault"
            className="ml-2 block text-sm text-gray-700"
          >
            Set as default shipping address
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-[#BA8B4E] text-white rounded-md hover:bg-[#9a7542] disabled:opacity-50"
        >
          {isLoading
            ? 'Saving...'
            : isEditing
              ? 'Update Address'
              : 'Save Address'}
        </button>
      </div>
    </form>
  )
}
