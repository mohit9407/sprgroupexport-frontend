'use client'

import { FaMapMarkerAlt } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { verifyGST, clearGSTData } from '@/features/gst/gstSlice'
import { Country, State, City } from 'country-state-city'

export default function AddressForm({
  initialFormData = {
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
  },
  onSubmit,
  handleSubmit, // Alias for onSubmit
  handleCancel,
  isLoading = false,
  isEditing = false,
  hasGst = false, // When true, it means GST is already set, so we should hide the GST field
}) {
  // State for countries, states, and cities
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    countryCode: '+91', // Default to India's country code
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
    gst: '',
    pancard: '',
    country: 'India',
  })

  // Update form data when initialFormData changes (for edit mode)
  useEffect(() => {
    if (initialFormData) {
      // Ensure country code has + prefix if it's missing
      const countryCode = initialFormData.countryCode
        ? initialFormData.countryCode.startsWith('+')
          ? initialFormData.countryCode
          : `+${initialFormData.countryCode}`
        : '+91'

      setFormData((prev) => ({
        ...prev,
        ...initialFormData,
        countryCode,
        country: initialFormData.country || 'India',
      }))
    }
  }, [initialFormData])
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...initialFormData,
    }))
  }, [initialFormData])

  useEffect(() => {
    if (formData.country && countries.length > 0) {
      const countryData = countries.find((c) => c.name === formData.country)
      if (countryData) {
        const countryStates = State.getStatesOfCountry(countryData.isoCode)
        setStates(countryStates)

        if (formData.state) {
          const stateData = countryStates.find((s) => s.name === formData.state)
          if (stateData) {
            const stateCities = City.getCitiesOfState(
              countryData.isoCode,
              stateData.isoCode,
            )
            setCities(stateCities)
          }
        }
      }
    }
  }, [formData.country, formData.state, countries])

  const dispatch = useDispatch()
  const {
    loading: gstLoading,
    verifiedData,
    error: gstError,
  } = useSelector((state) => state.gst)

  // Load countries on component mount and set initial form data
  useEffect(() => {
    const allCountries = Country.getAllCountries().map((country) => {
      // Ensure phonecode is a string and has + prefix
      let phonecode = String(country.phonecode)
      if (!phonecode.startsWith('+')) {
        phonecode = `+${phonecode}`
      }

      return {
        ...country,
        phonecode,
        // Add a displayPhoneCode that's guaranteed to have + prefix
        displayPhoneCode: phonecode.startsWith('+')
          ? phonecode
          : `+${phonecode}`,
      }
    })

    setCountries(allCountries)

    // Set initial form data after countries are loaded
    if (initialFormData) {
      // Ensure country code has + prefix if it's missing
      let countryCode = initialFormData.countryCode || ''
      if (countryCode && !countryCode.startsWith('+')) {
        countryCode = `+${countryCode}`
      } else if (!countryCode) {
        // Default to India's country code if none provided
        const india = allCountries.find((c) => c.name === 'India')
        countryCode = india ? india.phonecode : '+91'
      }

      setFormData((prev) => ({
        ...prev,
        ...initialFormData,
        countryCode,
        country: initialFormData.country || 'India',
      }))
    }
  }, [])

  // Load states when country changes (but not during initial load)
  useEffect(() => {
    if (formData.country && countries.length > 0) {
      const countryData = countries.find((c) => c.name === formData.country)
      if (countryData) {
        const countryStates = State.getStatesOfCountry(countryData.isoCode)
        setStates(countryStates)

        // Only reset state and city if we're not in edit mode
        if (!initialFormData?.state) {
          setCities([])
          setFormData((prev) => ({ ...prev, state: '', city: '' }))
        } else if (initialFormData?.state) {
          // If we have a state in initial data, load its cities
          const stateData = countryStates.find(
            (s) => s.name === initialFormData.state,
          )
          if (stateData) {
            const stateCities = City.getCitiesOfState(
              countryData.isoCode,
              stateData.isoCode,
            )
            setCities(stateCities)
          }
          // Only reset cities when country changes (not during initial load)
          if (
            !initialFormData.state ||
            initialFormData.state !== formData.state
          ) {
            setCities([])
            setFormData((prev) => ({ ...prev, state: '', city: '' }))
          }
        }
      }
    }
  }, [formData.country, countries, initialFormData])

  // Load cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const countryData = countries.find((c) => c.name === formData.country)
      const stateData = states.find((s) => s.name === formData.state)
      if (countryData && stateData) {
        const stateCities = City.getCitiesOfState(
          countryData.isoCode,
          stateData.isoCode,
        )
        setCities(stateCities)

        // Only reset city if it's not in the new list of cities or not in initial data
        const currentCity = formData.city
        const cityExists = stateCities.some((city) => city.name === currentCity)
        if (!cityExists && !initialFormData?.city) {
          setFormData((prev) => ({ ...prev, city: '' }))
          // Only reset city when state changes (not during initial load)
          if (!initialFormData.city || initialFormData.city !== formData.city) {
            setFormData((prev) => ({ ...prev, city: '' }))
          }
        }
      }
    }
  }, [formData.state, formData.country, countries, states])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Special handling for country code to ensure it has + prefix
    if (name === 'countryCode') {
      let newValue = value
      // Ensure the country code has a + prefix
      if (newValue && !newValue.startsWith('+')) {
        newValue = `+${newValue}`
      }
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmitForm = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    // Support both onSubmit and handleSubmit props for backward compatibility
    const submitHandler = onSubmit || handleSubmit
    if (typeof submitHandler === 'function') {
      // Include both countryCode and mobile in the submitted data
      const submissionData = {
        ...formData,
        countryCode: formData.countryCode, // Include country code
        mobileNo: formData.mobile, // Keep mobile number as is
        phone: `${formData.countryCode}${formData.mobile}`, // Also include combined phone for backward compatibility
      }
      submitHandler(submissionData)
    } else {
      console.error('No submit handler provided to AddressForm')
    }
  }
  const handleGSTBlur = (e) => {
    const gstNumber = e.target.value.trim()
    if (gstNumber && gstNumber.length === 15) {
      dispatch(verifyGST(gstNumber))
    } else if (gstNumber) {
      dispatch(clearGSTData())
    }
  }

  // Clear GST data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearGSTData())
    }
  }, [dispatch])

  // Update form data when GST is verified
  useEffect(() => {
    if (verifiedData?.data) {
      const { lgnm, pradr, gstin, ctb, stj, tradeNam } = verifiedData.data
      const addressParts = pradr?.addr || {}

      // Extract PAN from GSTIN (characters 2-12)
      const pancard = gstin ? gstin.substring(2, 12) : ''

      // Extract address components
      const stateCode = addressParts.stcd || ''
      let stateName = ''
      let cityName = addressParts.dst || ''
      const address = pradr?.adr || ''
      const zipCode = addressParts.pncd || ''

      // Set country code to India for Indian GST numbers
      const indiaCountry = countries.find((c) => c.name === 'India')
      const countryCode = indiaCountry ? indiaCountry.phonecode : '+91'

      // Find state by code if available
      if (stateCode) {
        const stateObj = states.find((s) => s.isoCode === stateCode)
        stateName = stateObj?.name || stateName
      } else if (stj) {
        // Fallback to parsing from stj if state code not available
        stateName = stj.split('State - ')[1]?.split(',')[0]?.trim() || ''
      }

      // If city not found in address parts, try to extract from address
      if (!cityName && address) {
        const addressParts = address.split(',').map((part) => part.trim())
        // Try to find city in the last few parts of the address
        for (let i = Math.min(3, addressParts.length - 1); i >= 0; i--) {
          const part = addressParts[addressParts.length - 1 - i]
          if (part && part !== stateName && !/^\d+$/.test(part)) {
            cityName = part
            break
          }
        }
      }

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          // GST & PAN Details
          gst: gstin || prev.gstNumber,
          pancard: pancard,
          // Business/Personal Details
          name: lgnm || prev.name,
          // Address Details
          address: address || prev.address,
          city: cityName || prev.city,
          state: stateName || prev.state,
          zipCode: zipCode || prev.zipCode,
          country: 'India', // Default to India for GST
          // Additional fields from GST data if needed
          ...(stj && { additionalInfo: stj }),
          countryCode,
        }

        return updatedData
      })

      // Update cities based on selected state
      if (stateName) {
        const countryData = countries.find((c) => c.name === 'India')
        if (countryData) {
          const countryStates = State.getStatesOfCountry(countryData.isoCode)
          setStates(countryStates)

          // Set cities for the selected state
          const stateData = countryStates.find((s) => s.name === stateName)
          if (stateData) {
            const stateCities = City.getCitiesOfState(
              countryData.isoCode,
              stateData.isoCode,
            )
            setCities(stateCities)
          }
        }
      }
    }
  }, [verifiedData])

  return (
    <form
      onSubmit={handleSubmitForm}
      className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!hasGst && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Number (Optional)
            </label>
            <input
              type="text"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              onBlur={handleGSTBlur}
              placeholder="Enter 15-digit GST number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c89b5a] focus:border-[#c89b5a]"
              maxLength={15}
            />
            {gstLoading && (
              <p className="mt-1 text-sm text-gray-500">Verifying GST...</p>
            )}
            {gstError && (
              <p className="mt-1 text-sm text-red-600">{gstError}</p>
            )}
            {verifiedData?.data && (
              <p className="mt-1 text-sm text-green-600">
                GST verified successfully!
              </p>
            )}
          </div>
        )}

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
          <div className="flex">
            <select
              name="countryCode"
              value={formData.countryCode || '+91'}
              onChange={handleChange}
              className="w-1/3 px-2 py-2 border border-r-0 border-gray-300 rounded-l-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none bg-white"
            >
              {countries.map((country) => {
                // Ensure phonecode has + prefix for consistent comparison
                const phonecode = country.phonecode.startsWith('+')
                  ? country.phonecode
                  : `+${country.phonecode}`
                return (
                  <option key={country.isoCode} value={phonecode}>
                    {country.isoCode} {phonecode}
                  </option>
                )
              })}
            </select>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
              placeholder="Mobile Number"
              required
              pattern="[0-9]{6,15}"
              title="Please enter a valid mobile number (6-15 digits)"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Full number: {formData.countryCode} {formData.mobile}
          </p>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            required
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.iso2} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            required
            disabled={!formData.country}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.iso2} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            required
            disabled={!formData.state}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
            {/* Add current city as an option if it's not in the list but exists in formData */}
            {formData.city && !cities.some((c) => c.name === formData.city) && (
              <option key="current-city" value={formData.city}>
                {formData.city}
              </option>
            )}
          </select>
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
            PIN Code
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            placeholder="Postal/ZIP Code"
            required
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN Card Number (Optional)
          </label>
          <input
            type="text"
            name="pancard"
            value={formData.pancard || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
            placeholder="PAN Card Number"
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            title="Please enter a valid PAN number (e.g., ABCDE1234F)"
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

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={(e) => {
            handleSubmitForm(e)
          }}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#BA8B4E] hover:bg-[#9A6F3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E] disabled:opacity-50"
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
