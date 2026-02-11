'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from '@/utils/toastConfig'
import {
  addAddress,
  getAddresses,
  setDefaultAddress,
  deleteAddress,
  updateAddress,
} from '@/features/shippingAddress/shippingAddressSlice'
import AddressForm from '@/components/address/AddressForm'
import AddressList from '@/components/address/AddressList'
import PageHeader from '@/components/address/PageHeader'

export default function ShippingAddressPage() {
  const dispatch = useDispatch()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isDefaultLoading, setIsDefaultLoading] = useState(false)

  const {
    addresses = [],
    isLoading,
    isAddressesLoading,
  } = useSelector((state) => state.shippingAddress)

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
  })

  const hasAnyAddressWithGST = addresses.some((address) => address.gst)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Handle both add and update
  const handleSubmit = async (formData) => {
    const addressData = {
      name: formData.name,
      mobile: formData.mobile,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      isDefault: formData.isDefault,
      gst: formData.gst || undefined,
      pancard: formData.pancard || undefined,
      country: formData.country || 'India',
    }

    try {
      if (editingId) {
        await dispatch(
          updateAddress({ id: editingId, ...addressData }),
        ).unwrap()
      } else {
        await dispatch(addAddress(addressData)).unwrap()
      }

      // Refresh the addresses list
      await dispatch(getAddresses()).unwrap()

      // Reset form
      resetForm()

      toast.success(
        editingId
          ? 'Address updated successfully'
          : 'Address added successfully',
      )
    } catch (error) {
      console.error('Failed to save address:', error)
      toast.error(error.message || 'Failed to save address')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
    })
    setEditingId(null)
    setIsAddingNew(false)
  }

  // Handle edit button click
  const handleEdit = (address) => {
    setFormData({
      name: address.fullName || address.name || '',
      mobile: address.mobileNo || address.mobile || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || address.zipCode || '',
      isDefault: address.isDefault || false,
      gst: address.gst || '',
      pancard: address.pancard || '',
    })
    setEditingId(address._id)
    setIsAddingNew(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel editing/adding
  const handleCancel = () => {
    resetForm()
  }

  // Fetch addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        await dispatch(getAddresses()).unwrap()
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
        toast.error(error.message || 'Failed to load addresses')
      }
    }

    fetchAddresses()
  }, [dispatch])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await dispatch(deleteAddress(id)).unwrap()
        toast.success('Address deleted successfully')
      } catch (error) {
        console.error('Failed to delete address:', error)
        toast.error(error.message || 'Failed to delete address')
      }
    }
  }

  const setAsDefault = async (id) => {
    try {
      setIsDefaultLoading(true)
      await dispatch(setDefaultAddress(id)).unwrap()
      // Refresh addresses after setting default
      await dispatch(getAddresses()).unwrap()
      toast.success('Default address updated successfully')
    } catch (error) {
      console.error('Failed to set default address:', error)
      toast.error(error.message || 'Failed to update default address')
    } finally {
      setIsDefaultLoading(false)
    }
  }

  const handleAddNew = () => {
    resetForm()
    setIsAddingNew(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Shipping Address"
          subtitle="Manage your shipping addresses"
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {isAddingNew ? (
              <>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <AddressForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  handleCancel={handleCancel}
                  isLoading={isLoading}
                  isEditing={!!editingId}
                  hasGst={!!formData.gst || hasAnyAddressWithGST}
                  initialFormData={formData}
                />
              </>
            ) : (
              <AddressList
                addresses={addresses}
                isAddressesLoading={isAddressesLoading}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={setAsDefault}
                isDefaultLoading={isDefaultLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
