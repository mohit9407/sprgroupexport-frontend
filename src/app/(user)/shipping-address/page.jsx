'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaEdit,
  FaMapMarkerAlt,
  FaHome,
  FaBuilding,
} from 'react-icons/fa'

export default function ShippingAddressPage() {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Test User',
      company: 'Test Company',
      address: '123 Test Street, Test Area',
      city: 'Test City',
      state: 'Test State',
      pinCode: '123456',
      isDefault: true,
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    isDefault: false,
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
    // If it's a new address, add it to the list
    const newAddress = {
      ...formData,
      id: addresses.length + 1,
    }

    setAddresses((prev) => [newAddress, ...prev])
    setIsAddingNew(false)
    setFormData({
      name: '',
      company: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      isDefault: false,
    })
  }

  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

  const setAsDefault = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">
              Shipping Address
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your shipping addresses
            </p>
          </div>

          <div className="p-6">
            {/* Add New Address Button */}
            {!isAddingNew && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center justify-center w-full md:w-auto px-4 py-2 border border-[#BA8B4E] text-[#BA8B4E] rounded-md hover:bg-[#f9f5f0] mb-6 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add New Address
              </button>
            )}

            {/* Add New Address Form */}
            {isAddingNew && (
              <form
                onSubmit={handleSubmit}
                className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Add New Address
                </h3>

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
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
                      placeholder="Company Name"
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

                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#BA8B4E] text-white rounded-md hover:bg-[#9a7542] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E] transition-colors"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            <div className="space-y-6">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-3 rounded-full mr-4">
                        {address.isDefault ? (
                          <FaHome className="text-[#BA8B4E] text-xl" />
                        ) : (
                          <FaBuilding className="text-gray-500 text-xl" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">
                            {address.name}
                          </h3>
                          {address.isDefault && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {address.company}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {address.address}
                        </p>
                        <p className="text-sm text-gray-700">
                          {address.city}, {address.state} - {address.pinCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setAsDefault(address.id)}
                        disabled={address.isDefault}
                        className={`p-2 rounded-md ${
                          address.isDefault
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title={
                          address.isDefault
                            ? 'Default Address'
                            : 'Set as Default'
                        }
                      >
                        <FaHome className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {}}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                        title="Edit Address"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                        title="Delete Address"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
