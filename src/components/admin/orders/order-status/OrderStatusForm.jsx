'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormAdminInputRow } from '../../AdminInputRow'
import { FormAdminSelect } from '../../AdminSelect'
import { useRouter } from 'next/navigation'
import * as yup from 'yup'
import { toast } from '@/utils/toastConfig'
import { useDispatch } from 'react-redux'
import {
  updateOrderStatus,
  addNewOrderStatus,
} from '@/features/orderStatus/orderStatusSlice'

const orderStatusSchema = yup.object({
  statusName: yup.string().required('Status name is required'),
  isDefault: yup.boolean().default(false),
})

export function OrderStatusForm({
  mode = 'add',
  defaultValues,
  title = 'Add Order Status',
  id,
}) {
  const isEditMode = mode === 'edit'
  const router = useRouter()
  const dispatch = useDispatch()

  const formMethods = useForm({
    resolver: yupResolver(orderStatusSchema),
    defaultValues: {
      statusName: defaultValues?.statusName || '',
      isDefault: defaultValues?.isDefault || false,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (values) => {
    try {
      if (isEditMode && id) {
        const result = await dispatch(
          updateOrderStatus({
            id,
            data: {
              orderStatus: values.statusName,
              isDefault: values.isDefault,
            },
          }),
        ).unwrap()
        toast.success('Order status updated successfully!')
      } else {
        // Handle create new status
        const result = await dispatch(
          addNewOrderStatus({
            orderStatus: values.statusName,
            isDefault: values.isDefault === true,
          }),
        ).unwrap()

        toast.success('Order status created successfully!')
        router.push('/admin/orders/order-status')
      }
    } catch (error) {
      console.error('Error submitting order status:', error)
      toast.error(error.message || 'Failed to save order status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <FormAdminInputRow
              name="statusName"
              label="Order Status (English)"
              placeholder="Enter status name"
              required
              helpText="Please enter the order status name in English"
            />

            <FormAdminSelect
              name="isDefault"
              label="Set Default"
              options={[
                { label: 'No', value: 'false' },
                { label: 'Yes', value: 'true' },
              ]}
              helpText="Set this status as default for new orders"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              {isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default OrderStatusForm
