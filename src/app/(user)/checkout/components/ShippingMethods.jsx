import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchShippingMethods,
  selectAllShippingMethods,
  selectShippingStatus,
  selectShippingError,
} from '@/features/shipping-method/shippingMethodSlice'

export default function ShippingMethods({
  onContinue,
  initialMethod = null,
  shippingAddress = {},
}) {
  const dispatch = useDispatch()
  const allShippingMethods = useSelector(selectAllShippingMethods)
  const status = useSelector(selectShippingStatus)
  const error = useSelector(selectShippingError)
  const [selectedMethod, setSelectedMethod] = useState(
    initialMethod?._id || null,
  )

  // Filter shipping methods based on user's address
  const getApplicableMethods = useCallback(() => {
    if (!shippingAddress?.country) return allShippingMethods

    const { city, state, country } = shippingAddress
    const isIndia = country?.toLowerCase() === 'india'
    const isGujarat = state?.toLowerCase() === 'gujarat'
    const isSurat = city?.toLowerCase() === 'surat'

    return allShippingMethods
      .filter((method) => {
        if (!method.status || method.status !== 'active') return false

        const methodName = method.name?.toLowerCase() || ''
        if (!isIndia) return methodName.includes('international')
        if (!isGujarat) return methodName.includes('rest of india')
        if (!isSurat) return methodName.includes('rest of gujarat')
        return methodName.includes('surat city')
      })
      .sort((a, b) => a.price - b.price)
  }, [allShippingMethods, shippingAddress])

  const shippingMethods = getApplicableMethods()

  // Update selectedMethod when initialMethod changes
  useEffect(() => {
    if (initialMethod?._id && initialMethod._id !== selectedMethod) {
      setSelectedMethod(initialMethod._id)
    }
  }, [initialMethod])

  // Fetch shipping methods on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchShippingMethods())
    }
  }, [status, dispatch])

  // Set initial selected method if available
  useEffect(() => {
    let timer
    if (shippingMethods && shippingMethods.length > 0) {
      // If we have an initial method that's in the filtered list, use it
      const initialInList =
        initialMethod &&
        shippingMethods.some((m) => m._id === initialMethod._id)
      const defaultMethod = initialInList ? initialMethod : shippingMethods[0]

      if (!selectedMethod || !initialInList) {
        timer = setTimeout(() => {
          setSelectedMethod(defaultMethod._id)
          if (typeof onContinue === 'function') {
            onContinue({ shippingMethod: defaultMethod }, null, true)
          }
        }, 0)
      }
    }
    return () => clearTimeout(timer)
  }, [shippingMethods, selectedMethod, onContinue, initialMethod])

  const handleSubmit = (e) => {
    e.preventDefault()
    const selectedShippingMethod = shippingMethods.find(
      (method) => method._id === selectedMethod,
    )
    if (selectedShippingMethod) {
      onContinue(
        {
          shippingMethod: selectedShippingMethod, // Pass the complete method object
        },
        3, // Go to Order Details (step 3)
      )
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold uppercase mb-2">Shipping Methods</h2>
      <p className="text-sm text-gray-600 mb-6">
        Please select the preferred shipping method to use on this order.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
          {status === 'succeeded' && shippingMethods.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                AVAILABLE SHIPPING METHODS
              </h3>
            </div>
          )}

          <div className="p-4">
            {status === 'loading' && (
              <div className="text-center py-4">
                Loading shipping methods...
              </div>
            )}
            {status === 'failed' && (
              <div className="text-red-500 text-sm py-4">
                Error loading shipping methods: {error}
              </div>
            )}
            {status === 'succeeded' && shippingMethods.length > 0 ? (
              shippingMethods.map((method) => {
                if (!method) return null

                return (
                  <div
                    key={method._id}
                    className="flex items-center py-2 px-4 hover:bg-gray-50"
                  >
                    <input
                      id={method._id}
                      name="shipping-method"
                      type="radio"
                      className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] border-gray-300"
                      checked={selectedMethod === method._id}
                      onChange={() => setSelectedMethod(method._id)}
                      required
                    />
                    <label
                      htmlFor={method._id}
                      className="ml-3 flex-1 py-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="block text-sm font-medium text-gray-900">
                          {method.name}
                        </span>
                        <span className="block text-xs text-gray-500 mt-1">
                          {method.description || 'Standard delivery'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#c89b5a] ml-4 whitespace-nowrap">
                        ₹{Number(method.price).toLocaleString('en-IN')}
                      </span>
                    </label>
                  </div>
                )
              })
            ) : status === 'succeeded' ? (
              <div className="text-center py-4">
                No shipping methods available for your location
              </div>
            ) : status === 'loading' ? (
              <div className="text-center py-4">
                Loading shipping methods...
              </div>
            ) : (
              <div className="text-red-500 text-sm py-4">
                Error loading shipping methods: {error || 'Unknown error'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="bg-[#c89b5a] text-white px-8 py-3 rounded-md uppercase text-sm font-medium hover:bg-[#b38950] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedMethod || status === 'loading'}
          >
            {status === 'loading' ? 'LOADING...' : 'CONTINUE'}
          </button>
        </div>
      </form>
    </div>
  )
}
