'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, FormProvider } from 'react-hook-form'
import {
  fetchShippingMethods,
  updateShippingMethods,
  selectShippingStatus,
  selectShippingError,
} from '@/features/shipping-method/shippingMethodSlice'
import { toast } from '@/utils/toastConfig'
import { FormAdminInputRow } from '@/components/admin'

export default function EditShippingMethodPage() {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()

  const methods = useSelector((state) => state.shipping.methods)
  const status = useSelector(selectShippingStatus)
  const error = useSelector(selectShippingError)

  const shippingMethod = methods.find((m) => m._id === id)

  const methodsForm = useForm({
    defaultValues: {
      name: '',
      price: '',
      status: 'active',
      isDefault: false,
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methodsForm

  useEffect(() => {
    if (!methods || methods.length === 0) {
      dispatch(fetchShippingMethods())
    }
  }, [dispatch, methods])

  useEffect(() => {
    if (shippingMethod) {
      reset({
        name: shippingMethod.name || '',
        price: shippingMethod.price || '',
        status: shippingMethod.status || 'active',
        isDefault: shippingMethod.isDefault || false,
      })
    }
  }, [shippingMethod, reset])

  const onSubmit = async (data) => {
    try {
      await dispatch(
        updateShippingMethods({
          id,
          data,
        }),
      ).unwrap()

      toast.success('Shipping method updated successfully')
      router.push('/admin/shipping-methods')
    } catch (err) {
      toast.error(err?.message || 'Failed to update shipping method')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (!shippingMethod) {
    return <div>Shipping method not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">
        Edit Shipping Method: {shippingMethod._id}
      </h1>

      <FormProvider {...methodsForm}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormAdminInputRow name="name" label="Shipping Title" required />

          <FormAdminInputRow
            name="price"
            label="Price"
            type="number"
            required
          />

          <hr className="my-6 border-gray-300" />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
