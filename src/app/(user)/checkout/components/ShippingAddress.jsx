import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAddresses,
  setDefaultAddress,
  addAddress,
} from '@/features/shippingAddress/shippingAddressSlice'
import AddressForm from '@/components/address/AddressForm'

export default function ShippingAddress({ onContinue, initialData = {} }) {
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const { addresses, isLoading, isError, message } = useSelector(
    (state) => state.shippingAddress,
  )

  const [selectedAddressId, setSelectedAddressId] = useState(
    initialData?._id || null,
  )
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  // Check if any address has GST
  const hasAnyAddressWithGST = addresses.some((address) => address.gst)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
    gst: '',
    pancard: '',
    country: 'India',
  })

  useEffect(() => {
    // Fetch addresses when component mounts
    dispatch(getAddresses())
  }, [dispatch])

  // Set the first address as selected by default when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0) {
      let addressToSelect = null

      // If we have initialData with an ID, use that
      if (initialData?._id) {
        addressToSelect = addresses.find((addr) => addr._id === initialData._id)
      }
      // Otherwise, if no address is selected yet, use the default or first address
      else if (!selectedAddressId) {
        addressToSelect =
          addresses.find((addr) => addr.isDefault) || addresses[0]
      }

      // Only update if we found an address and it's different from the currently selected one
      if (
        addressToSelect &&
        (!selectedAddressId || addressToSelect._id !== selectedAddressId)
      ) {
        setSelectedAddressId(addressToSelect._id)
        // Notify parent component about the selected address
        onContinue({ shippingAddress: addressToSelect }, null, true)
      }
    }
    // We're intentionally not including onContinue in the deps array to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length, initialData?._id, selectedAddressId])

  const handleSetDefault = async (addressId, e) => {
    e.stopPropagation()
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap()
      setSelectedAddressId(addressId)
    } catch (error) {
      console.error('Failed to set default address:', error)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleFormSubmit = async (e) => {
    // Handle both direct form submission and programmatic call with formData
    const formDataToUse = e?.preventDefault ? formData : e

    if (e?.preventDefault) {
      e.preventDefault()
    }

    try {
      const newAddress = {
        fullName: formDataToUse.name || '',
        name: formDataToUse.name || '', // Some APIs might expect 'name' instead of 'fullName'
        mobileNo: formDataToUse.mobile || '',
        mobile: formDataToUse.mobile || '', // Some APIs might expect 'mobile' instead of 'mobileNo'
        address: formDataToUse.address || '',
        city: formDataToUse.city || '',
        state: formDataToUse.state || '',
        zipCode: formDataToUse.zipCode || '',
        isDefault: Boolean(formDataToUse.isDefault),
        country: formDataToUse.country || 'India',
        gst: formDataToUse.gst || '',
        pancard: formDataToUse.pancard || '',
      }

      const result = await dispatch(addAddress(newAddress)).unwrap()

      setShowNewAddressForm(false)
      await dispatch(getAddresses())
      setFormData({
        name: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
      })
    } catch (error) {
      console.error('Failed to save address:', error)
    }
  }

  const handleCancelNewAddress = () => {
    setShowNewAddressForm(false)
    setFormData({
      name: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
      gst: '',
      pancard: '',
      country: 'India',
    })
  }

  const handleSubmit = () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address')
      return
    }

    const selectedAddress = addresses.find(
      (address) => address._id === selectedAddressId,
    )

    if (selectedAddress) {
      onContinue({ shippingAddress: selectedAddress }, 2) // Pass the next step (2)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold uppercase mb-6">
        SELECT EXISTING ADDRESS
      </h2>

      {isLoading ? (
        <div className="text-center py-4">Loading addresses...</div>
      ) : isError ? (
        <div className="text-red-500 text-center py-4">
          {message || 'Failed to load addresses'}
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {addresses.length > 0 || showNewAddressForm ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedAddressId === address._id && !showNewAddressForm
                      ? 'border-[#c89b5a] bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    const selectedAddress = addresses.find(
                      (addr) => addr._id === address._id,
                    )
                    setSelectedAddressId(address._id)
                    setShowNewAddressForm(false)
                    // Update parent component with the selected address
                    onContinue({ shippingAddress: selectedAddress })
                  }}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id={`address-${address._id}`}
                      name="address"
                      className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] mt-1"
                      checked={
                        selectedAddressId === address._id && !showNewAddressForm
                      }
                      onChange={() => {
                        const selectedAddress = addresses.find(
                          (addr) => addr._id === address._id,
                        )
                        setSelectedAddressId(address._id)
                        setShowNewAddressForm(false)
                        // Update parent component with the selected address
                        onContinue({ shippingAddress: selectedAddress })
                      }}
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <label
                          htmlFor={`address-${address._id}`}
                          className="block text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {address.fullName}
                        </label>
                        <div className="flex gap-2">
                          {address.isDefault && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                          {address.gst && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              WITH GST
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {address.address}, {address.city}, {address.state},{' '}
                        {address.country}, {address.zipCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        Phone: {address.mobileNo}
                      </p>
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => handleSetDefault(address._id, e)}
                          className="mt-2 text-xs text-amber-700 hover:text-amber-800"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No saved addresses found
            </div>
          )}

          {!showNewAddressForm && (
            <div className="flex items-center">
              <input
                type="radio"
                id="new-address"
                name="address-type"
                className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a]"
                checked={showNewAddressForm}
                onChange={() => setShowNewAddressForm(true)}
              />
              <label
                htmlFor="new-address"
                className="ml-2 text-sm text-gray-700"
              >
                Add New Address
              </label>
            </div>
          )}
        </div>
      )}

      {showNewAddressForm && (
        <div className="mb-6">
          <AddressForm
            formData={formData}
            handleChange={handleFormChange}
            handleSubmit={handleFormSubmit}
            handleCancel={handleCancelNewAddress}
            isLoading={isLoading}
            hasGst={!!formData.gst || hasAnyAddressWithGST}
          />
        </div>
      )}

      <div className="mt-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedAddressId || showNewAddressForm}
          className={`bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium transition-colors ${
            isLoading || !selectedAddressId || showNewAddressForm
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#b38950]'
          }`}
        >
          {isLoading ? 'Loading...' : 'CONTINUE'}
        </button>
      </div>
    </div>
  )
}
