'use client'

import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { FormAdminInputRow } from '../AdminInputRow'
import { useEffect } from 'react'
import { FormAdminSelect } from '../AdminSelect'
import AdminTextAreaRow from '@/components/AdminTextAreaRow/AdminTextAreaRow'
import { useState } from 'react'
import AddressForm from '@/components/address/AddressForm'
import api from '@/lib/axios'
import { toast } from '@/utils/toastConfig'

export default function OrderFormPage({
  mode = 'add',
  defaultValues,
  title = 'Manual User Order',
  onSubmit,
  submitting = false,
  productOptions = [],
  shippingMethodOptions = [],
  paymentMethodOptions = [],
  paymentStatusOptions = [],
  orderStatusOptions = [],
  userData,
}) {
  const isEditMode = mode === 'edit'

  const methods = useForm({
    defaultValues: {
      userId: defaultValues?.userId ?? '',
      email: defaultValues?.email ?? '',
      shippingAddressId: defaultValues?.shippingAddressId ?? '',
      shippingMethod: defaultValues?.shippingMethod ?? '',
      shippingCost: defaultValues?.shippingCost ?? 0,
      products:
        Array.isArray(defaultValues?.products) && defaultValues.products.length
          ? defaultValues.products
          : [{ productId: '', quantity: 1 }],
      paymentMethod: defaultValues?.paymentMethod ?? '',
      paymentStatus: defaultValues?.paymentStatus ?? '',
      orderStatus: defaultValues?.orderStatus ?? '',
      comments: defaultValues?.comments ?? '',
      onlyAdminCommentMessage:
        defaultValues?.onlyAdminComment?.[0]?.message ?? '',
      paidAmount: defaultValues?.paidAmount ?? 0,
      remainingAmount: defaultValues?.remainingAmount ?? 0,
    },
  })

  // Get addresses from userData prop
  const [addresses, setAddresses] = useState(
    userData?.user?.shippingAddress || [],
  )

  const hasAnyAddressWithGST = addresses.some((address) => address.gst)

  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultValues?.shippingAddressId ||
      userData?.defaultShippingAddressId ||
      '',
  )
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    gst: '',
    pancard: '',
    isDefault: false,
  })

  const { reset, handleSubmit, control } = methods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  const shippingMethodValue = methods.watch('shippingMethod')
  const shippingCostValue = methods.watch('shippingCost')
  const paidAmountValue = methods.watch('paidAmount')

  // Watch all product fields to ensure subtotal updates
  const productValues = fields.map((_, index) => ({
    id: methods.watch(`products.${index}.productId`),
    qty: methods.watch(`products.${index}.quantity`),
  }))

  const productSubtotal = productValues.reduce((sum, item) => {
    const product = productOptions.find((p) => p.value === item?.id)
    const price = product?.price || 0
    const qty = Number(item?.qty) || 0
    return sum + price * qty
  }, 0)

  const orderTotal = productSubtotal + (Number(shippingCostValue) || 0)

  // Calculate remaining amount automatically
  const paid = Number(paidAmountValue) || 0
  const remainingAmount = Math.max(0, orderTotal - paid)

  // Update remainingAmount field when it changes
  useEffect(() => {
    methods.setValue('remainingAmount', remainingAmount)
  }, [remainingAmount, methods])

  useEffect(() => {
    if (defaultValues) {
      reset({
        userId: defaultValues?.userId ?? '',
        email: defaultValues?.email ?? '',
        shippingAddressId: defaultValues?.shippingAddressId ?? '',
        shippingMethod: defaultValues?.shippingMethod ?? '',
        shippingCost: defaultValues?.shippingCost ?? 0,
        products:
          Array.isArray(defaultValues?.products) &&
          defaultValues.products.length
            ? defaultValues.products
            : [{ productId: '', quantity: 1 }],
        paymentMethod: defaultValues?.paymentMethod ?? '',
        paymentStatus: defaultValues?.paymentStatus ?? '',
        orderStatus: defaultValues?.orderStatus ?? '',
        comments: defaultValues?.comments ?? '',
        onlyAdminCommentMessage:
          defaultValues?.onlyAdminComment?.[0]?.message ?? '',
        paidAmount: defaultValues?.paidAmount ?? 0,
        remainingAmount: defaultValues?.remainingAmount ?? 0,
      })
    }
  }, [defaultValues, reset])

  useEffect(() => {
    const selected = (shippingMethodOptions || []).find(
      (opt) => opt?.value === shippingMethodValue,
    )

    if (selected && selected.price != null && selected.price !== '') {
      methods.setValue('shippingCost', Number(selected.price), {
        shouldDirty: true,
        shouldTouch: true,
      })
    }
  }, [methods, shippingMethodOptions, shippingMethodValue])

  const handleFormSubmit = async (addressData) => {
    try {
      setIsLoading(true)
      setIsError(false)
      setMessage('')

      if (editingAddressId) {
        // Validate required data
        if (!userData?.user?._id) {
          setIsError(true)
          setMessage('User information is missing. Please try again.')
          setIsLoading(false)
          return
        }

        // Update existing address via API
        const updateData = {
          fullName: addressData.name,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          zipCode: addressData.zipCode,
          mobileNo: addressData.mobile,
          gst: addressData.gst,
          pancard: addressData.pancard,
          isDefault: addressData.isDefault,
        }

        const response = await api.put(
          `/auth/admin/user/${userData?.user?._id}/shipping-addresses/${editingAddressId}`,
          updateData,
        )

        // Check if the response indicates success
        if (
          response &&
          (response.success || response.message || response.data)
        ) {
          console.log('Update successful')
        } else {
          console.warn('Unexpected response format:', response)
        }

        // Update the address in local state
        const addressIndex = addresses.findIndex(
          (addr) => addr._id === editingAddressId,
        )
        if (addressIndex !== -1) {
          const updatedAddresses = [...addresses]
          updatedAddresses[addressIndex] = {
            ...updatedAddresses[addressIndex],
            ...updateData,
          }
          setAddresses(updatedAddresses)
        }

        setMessage('Address updated successfully!')
        toast.success('Address updated successfully!')
        setEditingAddressId(null)
      } else {
        // Add new address via API
        const newAddressData = {
          fullName: addressData.name,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          zipCode: addressData.zipCode,
          mobileNo: addressData.mobile,
          gst: addressData.gst,
          pancard: addressData.pancard,
          isDefault: addressData.isDefault,
        }

        const response = await api.post(
          `/auth/admin/user/${userData?.user?._id}/add-shipping-address`,
          newAddressData,
        )

        const newAddress = {
          _id:
            response.data?.data?._id ||
            response.data?._id ||
            response._id ||
            Date.now().toString(),
          fullName: addressData.name,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          zipCode: addressData.zipCode,
          mobileNo: addressData.mobile,
          gst: addressData.gst,
          pancard: addressData.pancard,
          isDefault: addressData.isDefault,
        }

        setAddresses([...addresses, newAddress])

        // Select the new address
        setSelectedAddressId(newAddress._id)
        methods.setValue('shippingAddressId', newAddress._id)

        setMessage('Address added successfully!')
        toast.success('Address added successfully!')
      }

      setShowNewAddressForm(false)

      setFormData({
        name: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        gst: '',
        pancard: '',
        isDefault: false,
      })

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setIsError(true)
      const errorMsg = editingAddressId
        ? 'Failed to update address. Please try again.'
        : 'Failed to add address. Please try again.'
      setMessage(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelNewAddress = () => {
    setShowNewAddressForm(false)
    setEditingAddressId(null)
    setFormData({
      name: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      gst: '',
      pancard: '',
      isDefault: false,
    })
  }

  const handleEditAddress = (addressId, e) => {
    e.stopPropagation()
    const address = addresses.find((addr) => addr._id === addressId)
    if (address) {
      setFormData({
        name: address.fullName || '',
        mobile: address.mobileNo || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'India',
        gst: address.gst || '',
        pancard: address.pancard || '',
        isDefault: address.isDefault || false,
      })
      setEditingAddressId(addressId)
      setShowNewAddressForm(true)
    } else {
      console.error('Address not found with ID:', addressId)
      alert('Address not found!')
    }
  }

  const handleSetDefault = async (addressId, e) => {
    e.stopPropagation()
    try {
      const response = await api.put(
        `/auth/admin/user/${userData?.user?._id}/shipping-addresses/${addressId}`,
        { isDefault: true },
      )

      console.log('Set default API response:', response)

      // Update local state
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr._id === addressId,
      }))
      setAddresses(updatedAddresses)

      // Update selected address to the new default
      setSelectedAddressId(addressId)
      methods.setValue('shippingAddressId', addressId)

      setMessage('Default address updated successfully!')
      toast.success('Default address updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error setting default address:', error)
      setIsError(true)
      setMessage('Failed to update default address.')
      toast.error('Failed to update default address.')
    }
  }

  useEffect(() => {
    if (userData?.user?.shippingAddress) {
      setAddresses(userData.user.shippingAddress)
    }
  }, [userData])

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      // Prefer default address
      const defaultAddress =
        addresses.find((addr) => addr.isDefault) || addresses[0]

      setSelectedAddressId(defaultAddress._id)
      methods.setValue('shippingAddressId', defaultAddress._id)
    }
  }, [addresses])

  return (
    <div className="space-y-6">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit((data) => {
              const cleanedProducts = Array.isArray(data.products)
                ? data.products
                    .filter((p) => p?.productId && Number(p?.quantity) > 0)
                    .map((p) => ({
                      productId: p.productId,
                      quantity: Number(p.quantity || 1),
                    }))
                : []

              const payload = {
                userId: data.userId,
                shippingAddressId: data.shippingAddressId,
                shippingMethod: data.shippingMethod,
                shippingCost: Number(data.shippingCost || 0),
                products: cleanedProducts,
                paymentMethod: data.paymentMethod,
                paymentStatus: data.paymentStatus,
                orderStatus: data.orderStatus,
                comments: data.comments,
                onlyAdminComment: data.onlyAdminCommentMessage
                  ? [{ message: data.onlyAdminCommentMessage }]
                  : [],
                paidAmount: Number(data.paidAmount || 0),
                remainingAmount: Number(data.remainingAmount || 0),
              }

              onSubmit(payload)
            })(e)
          }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <FormAdminInputRow
              name="email"
              label="User Email"
              type="text"
              fullWidth
              readOnly
            />
            <h2 className="text-lg font-bold uppercase mb-6">
              SELECT EXISTING ADDRESS
            </h2>

            {isLoading ? (
              <div className="text-center py-4">Loading addresses...</div>
            ) : (
              <div className="space-y-4 mb-6">
                {addresses.length > 0 || showNewAddressForm ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border rounded-md p-4 cursor-pointer transition-colors ${
                          selectedAddressId === address._id &&
                          !showNewAddressForm
                            ? 'border-[#c89b5a] bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const selectedAddress = addresses.find(
                            (addr) => addr._id === address._id,
                          )
                          setSelectedAddressId(address._id)
                          setShowNewAddressForm(false)
                          methods.setValue('shippingAddressId', address._id)
                        }}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            id={`address-${address._id}`}
                            name="address"
                            className="h-4 w-4 text-[#c89b5a] focus:ring-[#c89b5a] mt-1"
                            checked={
                              selectedAddressId === address._id &&
                              !showNewAddressForm
                            }
                            onChange={() => {
                              const selectedAddress = addresses.find(
                                (addr) => addr._id === address._id,
                              )
                              setSelectedAddressId(address._id)
                              setShowNewAddressForm(false)
                              methods.setValue('shippingAddressId', address._id)
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
                              {address.address}, {address.city}, {address.state}
                              , {address.country}, {address.zipCode}
                            </p>
                            <p className="text-sm text-gray-600">
                              Phone: {address.mobileNo}
                            </p>
                            {!address.isDefault && (
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleSetDefault(address._id, e)
                                }
                                className="mt-2 text-xs text-amber-700 hover:text-amber-800 mr-3"
                              >
                                Set as default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleEditAddress(address._id, e)}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
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
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </label>
                  </div>
                )}
              </div>
            )}

            {showNewAddressForm && (
              <div className="mb-6">
                <AddressForm
                  initialFormData={formData}
                  onSubmit={handleFormSubmit}
                  handleCancel={handleCancelNewAddress}
                  isLoading={isLoading}
                  isEditing={!!editingAddressId}
                  hasGst={!!formData.gst || hasAnyAddressWithGST}
                />
              </div>
            )}

            <FormAdminSelect
              name="shippingMethod"
              label="Shipping Method"
              options={[
                { label: 'Select shipping method', value: '' },
                ...shippingMethodOptions,
              ]}
              fullWidth
            />
            <FormAdminInputRow
              name="shippingCost"
              label="Shipping Cost"
              type="number"
              fullWidth
              readOnly
            />
            <div className="mb-4">
              <div className="flex items-center justify-center gap-6">
                <h3 className="text-sm font-semibold text-gray-800 pl-8">
                  Products
                </h3>
                <button
                  type="button"
                  onClick={() => append({ productId: '', quantity: 1 })}
                  className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                >
                  Add Product
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {fields.map((f, index) => {
                  const selectedProduct = productOptions.find(
                    (p) =>
                      p.value === methods.watch(`products.${index}.productId`),
                  )
                  const price = selectedProduct?.price || 0
                  const qty =
                    Number(methods.watch(`products.${index}.quantity`)) || 0
                  const lineTotal = price * qty

                  return (
                    <div
                      key={f.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3"
                    >
                      <div className="md:col-span-6">
                        <FormAdminSelect
                          name={`products.${index}.productId`}
                          label="Product"
                          options={[
                            { label: 'Select product', value: '' },
                            ...productOptions,
                          ]}
                          fullWidth
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FormAdminInputRow
                          name={`products.${index}.quantity`}
                          label="Qty"
                          type="number"
                          fullWidth
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                          <span className="text-gray-500">Price:</span>{' '}
                          <span className="font-medium">₹{price}</span>
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                          <span className="text-gray-500">Total:</span>{' '}
                          <span className="font-medium">₹{lineTotal}</span>
                        </div>
                      </div>

                      <div className="md:col-span-1 flex items-start">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className=" px-4 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-end gap-4 text-sm">
                  <span className="text-gray-600">Product Subtotal:</span>
                  <span className="font-medium">₹{productSubtotal}</span>
                </div>
                <div className="flex justify-end gap-4 text-sm">
                  <span className="text-gray-600">Shipping Cost:</span>
                  <span className="font-medium">
                    ₹{Number(shippingCostValue) || 0}
                  </span>
                </div>
                <div className="flex justify-end gap-4 text-base font-semibold text-cyan-700">
                  <span>Order Total:</span>
                  <span>₹{orderTotal}</span>
                </div>
                {paid > 0 && (
                  <>
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-gray-600">Paid Amount:</span>
                      <span className="font-medium text-green-600">
                        ₹{paid}
                      </span>
                    </div>
                    <div className="flex justify-end gap-4 text-base font-semibold text-orange-600">
                      <span>Remaining:</span>
                      <span>₹{remainingAmount}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex col-span-3 gap-10 pl-60">
              <FormAdminInputRow
                name="paidAmount"
                label="Paid Amount"
                type="number"
                fullWidth
              />

              <FormAdminInputRow
                name="remainingAmount"
                label="Remaining Amount"
                type="number"
                fullWidth
                readOnly
              />
            </div>
            <FormAdminSelect
              name="paymentMethod"
              label="Payment Method"
              options={[
                { label: 'Select payment method', value: '' },
                ...paymentMethodOptions,
              ]}
              fullWidth
            />
            <FormAdminSelect
              name="paymentStatus"
              label="Payment Status"
              options={[
                { label: 'Select payment status', value: '' },
                ...paymentStatusOptions,
              ]}
              fullWidth
            />
            <FormAdminSelect
              name="orderStatus"
              label="Order Status"
              options={[
                { label: 'Select order status', value: '' },
                ...orderStatusOptions,
              ]}
              fullWidth
            />
            <Controller
              name="onlyAdminCommentMessage"
              control={methods.control}
              render={({ field, fieldState }) => (
                <AdminTextAreaRow
                  name="onlyAdminCommentMessage"
                  label="Only Admin Comment (Optional) Note: Only Admin Can See This Comment"
                  fullWidth
                  rows={4}
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              {submitting ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
