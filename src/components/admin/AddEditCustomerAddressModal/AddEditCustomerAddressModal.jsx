'use client'

import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormAdminInputRow } from '../AdminInputRow'
import { FormAdminSelect } from '../AdminSelect'
import { FormAdminCheckbox } from '../AdminCheckbox'
import { useDispatch, useSelector } from 'react-redux'
import {
  addCustomerAddress,
  updateCustomerAddress,
} from '@/features/customers/customersSlice'
import ButtonLoader from '../ButtonLoader'

export const addressSchema = yup.object({
  company: yup.string().nullable(),

  fullName: yup.string().required('Full name is required'),

  address: yup.string().required('Address is required'),
  suburb: yup.string().nullable(),

  zip: yup.string().required('Postcode is required').min(4, 'Invalid postcode'),

  city: yup.string().required('City is required'),

  country: yup.string().required('Country is required'),

  isDefault: yup.boolean().default(false),
})

export function AddEditCustomerAddressModal({
  userId,
  defaultValues,
  onClose,
}) {
  const isEditMode = Boolean(userId)
  const addressId = defaultValues?._id
  const dispatch = useDispatch()
  const { addAddress, updateAddress } = useSelector((state) => state.customers)
  const isLoading = addAddress?.isLoading || updateAddress?.isLoading
  const form = useForm({
    resolver: yupResolver(addressSchema),
    mode: 'onBlur',
    shouldUnregister: true,
    defaultValues: defaultValues || {
      company: '',
      fullName: '',
      address: '',
      suburb: '',
      zip: '',
      city: '',
      country: '',
      isDefault: false,
    },
  })

  const onSubmit = (values) => {
    if (isEditMode) {
      dispatch(updateCustomerAddress({ userId, addressId, data: values }))
    } else {
      dispatch(addCustomerAddress({ userId, data: values }))
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded shadow-lg p-4">
        <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
          <h3 className="text-lg font-semibold">
            {isEditMode ? 'Edit Address' : 'Add Address'}
          </h3>
          <button onClick={onClose}>✕</button>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormAdminInputRow name="company" label="Company" fullWidth />

            <FormAdminInputRow
              required
              name="fullName"
              label="Full Name"
              fullWidth
            />

            <FormAdminInputRow
              required
              name="address"
              label="Address"
              fullWidth
            />
            <FormAdminInputRow name="suburb" label="Suburb" fullWidth />

            <FormAdminInputRow required name="zip" label="Postcode" fullWidth />
            <FormAdminInputRow required name="city" label="City" fullWidth />

            <FormAdminSelect
              required
              fullWidth
              name="country"
              label="Country"
              options={[
                { label: 'Select Country', value: '' },
                { label: 'India', value: 'India' },
                { label: 'Australia', value: 'Australia' },
              ]}
            />

            <FormAdminCheckbox
              name="isDefault"
              label="Default Shipping Address"
              fullWidth
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading && <ButtonLoader className="inline-flex" />}
                {isEditMode ? 'Submit' : 'Add Address'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
