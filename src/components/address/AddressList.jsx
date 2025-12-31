'use client'

import { FaPlus } from 'react-icons/fa'
import AddressCard from './AddressCard'

export default function AddressList({
  addresses,
  isAddressesLoading,
  onAddNew,
  onEdit,
  onDelete,
  onSetDefault,
  isDefaultLoading,
}) {
  if (isAddressesLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA8B4E]"></div>
      </div>
    )
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shipping addresses found.
        <button
          onClick={onAddNew}
          className="ml-2 text-[#BA8B4E] hover:underline"
        >
          Add your first address.
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onAddNew}
        className="flex items-center justify-center w-full md:w-auto px-4 py-2 border border-[#BA8B4E] text-[#BA8B4E] rounded-md hover:bg-[#f9f5f0] mb-6 transition-colors"
      >
        <FaPlus className="mr-2" />
        Add New Address
      </button>

      {addresses.map((address) => (
        <AddressCard
          key={address._id}
          address={address}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          isDefaultLoading={isDefaultLoading}
        />
      ))}
    </div>
  )
}
