'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  createPaymentMethod,
  updatePaymentMethod,
} from '@/features/paymentMethod/paymentMethodSlice'
import { AdminInputRow } from '../AdminInputRow/AdminInputRow'

export default function PaymentMethodForm({
  initialData = null,
  isEdit = false,
}) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.paymentMethods)

  const [isPayPal, setIsPayPal] = useState(false)
  const [isRazorpay, setIsRazorpay] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    environment: 'SANDBOX', // Default to SANDBOX
    keyId: '',
    keySecret: '',
    clientId: '',
    clientSecret: '',
    testClientId: '',
    testClientSecret: '',
    testKeyId: '',
    testKeySecret: '',
  })
  useEffect(() => {
    if (isEdit && initialData && !formData.name) {
      const isPayPalMethod = initialData.name?.toLowerCase().includes('paypal')
      const isRazorpayMethod = initialData.name
        ?.toLowerCase()
        .includes('razorpay')
      setIsPayPal(isPayPalMethod)
      setIsRazorpay(isRazorpayMethod)

      setFormData({
        name: initialData.name || '',
        environment: initialData.environment || 'SANDBOX',
        keyId: initialData.keyId || '',
        keySecret: initialData.keySecret || '',
        testKeyId: initialData.testKeyId || '',
        testKeySecret: initialData.testKeySecret || '',
        clientId: initialData.clientId || '',
        clientSecret: initialData.clientSecret || '',
        testClientId: initialData.testClientId || '',
        testClientSecret: initialData.testClientSecret || '',
      })
    }
  }, [initialData, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }

      // Update isPayPal/isRazorpay state when name changes
      if (name === 'name') {
        const isPayPalMethod = value.toLowerCase().includes('paypal')
        const isRazorpayMethod = value.toLowerCase().includes('razorpay')
        setIsPayPal(isPayPalMethod)
        setIsRazorpay(isRazorpayMethod)
      }

      if (name === 'environment') {
        const newEnv = value
        const isPayPalMethod = newData.name.toLowerCase().includes('paypal')
        const isRazorpayMethod = newData.name.toLowerCase().includes('razorpay')
        if (isPayPalMethod) {
          return {
            ...newData,
            clientId: newEnv === 'SANDBOX' ? prev.clientId : prev.testClientId,
            clientSecret:
              newEnv === 'SANDBOX' ? prev.clientSecret : prev.testClientSecret,
            testClientId:
              newEnv === 'SANDBOX' ? prev.testClientId : prev.clientId,
            testClientSecret:
              newEnv === 'SANDBOX' ? prev.testClientSecret : prev.clientSecret,
          }
        } else if (isRazorpayMethod) {
          return {
            ...newData,
            keyId: newEnv === 'SANDBOX' ? prev.keyId : prev.testKeyId,
            keySecret:
              newEnv === 'SANDBOX' ? prev.keySecret : prev.testKeySecret,
            testKeyId: newEnv === 'SANDBOX' ? prev.testKeyId : prev.keyId,
            testKeySecret:
              newEnv === 'SANDBOX' ? prev.testKeySecret : prev.keySecret,
          }
        }
      }

      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const isPayPalMethod = formData.name.toLowerCase().includes('paypal')
      const isRazorpayMethod = formData.name.toLowerCase().includes('razorpay')
      const payload = { ...formData }

      if (isPayPalMethod) {
        // For PayPal, keep clientId/clientSecret and testClientId/testClientSecret
        delete payload.keyId
        delete payload.keySecret
      } else if (isRazorpayMethod) {
        // For Razorpay, keep keyId/keySecret and testKeyId/testKeySecret
        delete payload.clientId
        delete payload.clientSecret
        delete payload.testClientId
        delete payload.testClientSecret
      } else {
        // For non-PayPal/non-Razorpay, keep keyId/keySecret
        delete payload.clientId
        delete payload.clientSecret
        delete payload.testClientId
        delete payload.testClientSecret
        delete payload.testKeyId
        delete payload.testKeySecret
      }

      if (isEdit) {
        await dispatch(
          updatePaymentMethod({
            id: initialData._id,
            methodData: payload,
          }),
        ).unwrap()
        toast.success('Payment method updated successfully')
      } else {
        await dispatch(createPaymentMethod(payload)).unwrap()
        toast.success('Payment method created successfully')
      }
      router.push('/admin/payment-methods')
    } catch (error) {
      toast.error(error || 'Failed to save payment method')
    }
  }

  // Check if the payment method is Cash on Delivery
  const isCashOnDelivery = formData.name
    .toLowerCase()
    .includes('cash on delivery')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit' : 'Add New'} Payment Method
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          {!isCashOnDelivery && (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Environment
                </h3>
                <div className="flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="environment"
                      value="SANDBOX"
                      checked={formData.environment === 'SANDBOX'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sandbox</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="environment"
                      value="LIVE"
                      checked={formData.environment === 'LIVE'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Live</span>
                  </label>
                </div>
              </div>

              {/* PayPal: show sandbox/live credential fields */}
              {isPayPal ? (
                <>
                  {formData.environment === 'SANDBOX' ? (
                    <div className="space-y-4">
                      <AdminInputRow
                        label="Client ID (Sandbox)"
                        name="clientId"
                        value={formData.clientId}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'clientId',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter sandbox client ID"
                        className="w-full"
                      />
                      <AdminInputRow
                        label="Client Secret (Sandbox)"
                        name="clientSecret"
                        value={formData.clientSecret}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'clientSecret',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter sandbox client secret"
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AdminInputRow
                        label="Client ID (Live)"
                        name="testClientId"
                        value={formData.testClientId}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'testClientId',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter live client ID"
                        className="w-full"
                      />
                      <AdminInputRow
                        label="Client Secret (Live)"
                        name="testClientSecret"
                        value={formData.testClientSecret}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'testClientSecret',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter live client secret"
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              ) : isRazorpay ? (
                <>
                  {formData.environment === 'SANDBOX' ? (
                    <div className="space-y-4">
                      <AdminInputRow
                        label="Key ID (Sandbox)"
                        name="keyId"
                        value={formData.keyId}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'keyId',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter sandbox key ID"
                        className="w-full"
                      />
                      <AdminInputRow
                        label="Key Secret (Sandbox)"
                        name="keySecret"
                        value={formData.keySecret}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'keySecret',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter sandbox key secret"
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AdminInputRow
                        label="Key ID (Live)"
                        name="testKeyId"
                        value={formData.testKeyId}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'testKeyId',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter live key ID"
                        className="w-full"
                      />
                      <AdminInputRow
                        label="Key Secret (Live)"
                        name="testKeySecret"
                        value={formData.testKeySecret}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'testKeySecret',
                              value: e.target.value,
                            },
                          })
                        }
                        required
                        placeholder="Enter live key secret"
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <AdminInputRow
                    label="Key ID"
                    name="keyId"
                    value={formData.keyId || ''}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: 'keyId',
                          value: e.target.value,
                        },
                      })
                    }
                    required
                    placeholder="Enter key ID"
                    className="w-full"
                  />
                  <AdminInputRow
                    label="Key Secret"
                    name="keySecret"
                    value={formData.keySecret || ''}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: 'keySecret',
                          value: e.target.value,
                        },
                      })
                    }
                    required
                    placeholder="Enter key secret"
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Translation
            </h3>
            <div className="space-y-4">
              <AdminInputRow
                label="Name (English)"
                name="name"
                value={formData.name || ''}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: 'name',
                      value: e.target.value,
                    },
                  })
                }
                required
                placeholder="Enter payment method name"
                helpText="Payment Method Name (English)"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/admin/payment-methods')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
