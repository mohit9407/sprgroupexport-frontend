'use client'

import { FaHome, FaBuilding, FaEdit, FaTrash } from 'react-icons/fa'

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDefaultLoading,
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
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
                {address.fullName || address.name}
              </h3>
              {address.isDefault && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  Default
                </span>
              )}
              {address.gst && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  WITH GST
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {address.mobileNo || address.mobile}
            </p>
            <p className="text-sm text-gray-700 mt-1">{address.address}</p>
            <p className="text-sm text-gray-700">
              {address.city}, {address.state} - {address.zip || address.zipCode}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {/* Set as Default Button */}
          <div className="relative group">
            <button
              onClick={() => onSetDefault(address._id)}
              disabled={address.isDefault || isDefaultLoading}
              className={`p-2 rounded-md ${
                address.isDefault
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <FaHome className="h-4 w-4" />
            </button>
            <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
              {address.isDefault ? 'Default Address' : 'Set as Default'}
            </span>
          </div>

          {/* Edit Button */}
          <div className="relative group">
            <button
              onClick={() => onEdit(address)}
              className="p-2 text-blue-500 hover:text-blue-700"
              title="Edit address"
            >
              <FaEdit className="h-4 w-4" />
            </button>
            <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
              Edit Address
            </span>
          </div>

          {/* Delete Button */}
          <div className="relative group">
            <button
              onClick={() => onDelete(address._id)}
              className="p-2 text-red-500 hover:text-red-700"
              title="Delete address"
            >
              <FaTrash className="h-4 w-4" />
            </button>
            <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
              Delete Address
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
