import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAddresses,
  setDefaultAddress,
  addAddress,
} from '@/features/shippingAddress/shippingAddressSlice'
import AddressForm from '@/components/address/AddressForm'

export default function ShippingAddress({ onContinue, initialData = {} }) {
  const dispatch = useDispatch()
  const { addresses, isLoading, isError, message } = useSelector(
    (state) => state.shippingAddress,
  )

  const [selectedAddressId, setSelectedAddressId] = useState(
    initialData?._id || null,
  )
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    isDefault: false,
  })

  useEffect(() => {
    // Fetch addresses when component mounts
    dispatch(getAddresses())
  }, [dispatch])

  // Set the first address as selected by default when addresses are loaded
  useEffect(() => {
    let timer
    if (addresses.length > 0) {
      // If we have initialData with an ID, use that
      if (initialData?._id) {
        timer = setTimeout(() => setSelectedAddressId(initialData._id), 0)
      }
      // Otherwise, if no address is selected yet, use the default or first address
      else if (!selectedAddressId) {
        const defaultAddress =
          addresses.find((addr) => addr.isDefault) || addresses[0]
        if (defaultAddress) {
          timer = setTimeout(() => setSelectedAddressId(defaultAddress._id), 0)
        }
      }
    }
    return () => clearTimeout(timer)
  }, [addresses, initialData, selectedAddressId])

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
    e.preventDefault()
    try {
      // Log the form data before sending
      console.log('Form data before submission:', formData)

      const newAddress = {
        fullName: formData.name || '',
        name: formData.name || '', // Some APIs might expect 'name' instead of 'fullName'
        mobileNo: formData.mobile || '',
        mobile: formData.mobile || '', // Some APIs might expect 'mobile' instead of 'mobileNo'
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.pinCode || '',
        pinCode: formData.pinCode || '', // Include both zipCode and pinCode for compatibility
        isDefault: Boolean(formData.isDefault),
        country: 'India',
      }

      console.log('Sending address data:', newAddress)

      const result = await dispatch(addAddress(newAddress)).unwrap()
      console.log('Address saved successfully:', result)

      setShowNewAddressForm(false)
      await dispatch(getAddresses())
      setFormData({
        name: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
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
      pinCode: '',
      isDefault: false,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedAddressId && !showNewAddressForm) {
      alert('Please select an address or add a new one')
      return
    }

    const selectedAddress = addresses.find(
      (addr) => addr._id === selectedAddressId,
    )
    onContinue(
      {
        shippingAddress: selectedAddress || { isNew: true, ...formData },
      },
      2,
    )
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
          {addresses.length > 0 ? (
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
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
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
          />
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium hover:bg-[#b38950] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'CONTINUE'}
        </button>
      </div>
    </div>
  )
}
