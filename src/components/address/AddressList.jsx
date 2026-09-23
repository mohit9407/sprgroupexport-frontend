'use client'

import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import AddressCard from './AddressCard'
import ConfirmationModal from '../admin/ConfirmationModal'

export default function AddressList({
  addresses,
  isAddressesLoading,
  onAddNew,
  onEdit,
  onDelete,
  onSetDefault,
  isDefaultLoading,
}) {
  const [addressToDelete, setAddressToDelete] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (addressId) => {
    const address = addresses.find((addr) => addr._id === addressId)
    if (address) {
      setAddressToDelete(address)
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return

    try {
      setIsDeleting(true)
      await onDelete(addressToDelete._id)
      setIsDeleteModalOpen(false)
      setAddressToDelete(null)
    } catch (error) {
      console.error('Error deleting address:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false)
    setAddressToDelete(null)
  }
  if (isAddressesLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004372]"></div>
      </div>
    )
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shipping addresses found.
        <button
          onClick={onAddNew}
          className="ml-2 text-[#004372] hover:underline"
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
        className="flex items-center justify-center w-full md:w-auto px-4 py-2 border border-[#004372] text-[#004372] rounded-md hover:bg-[#E6F0F5] mb-6 transition-colors"
      >
        <FaPlus className="mr-2" />
        Add New Address
      </button>

      {addresses.map((address) => (
        <AddressCard
          key={address._id}
          address={address}
          onEdit={onEdit}
          onDelete={handleDeleteClick}
          onSetDefault={onSetDefault}
          isDefaultLoading={isDefaultLoading}
        />
      ))}

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        theme="error"
        isLoading={isDeleting}
      />
    </div>
  )
}
