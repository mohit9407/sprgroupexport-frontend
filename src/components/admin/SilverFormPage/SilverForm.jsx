import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FormAdminInputRow } from '../AdminInputRow'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'

const silverSchema = yup.object({
  purity: yup
    .number()
    .typeError('purity must be a number')
    .required('purity is required'),

  pricePerGram: yup
    .number()
    .typeError('Price per gram must be a number')
    .required('Price per purity is required'),
})

export default function SilverForm({
  mode = 'add',
  defaultValues,
  title = 'Add Silver',
  onSubmit,
}) {
  const router = useRouter()
  const isEditMode = mode === 'edit'

  const methods = useForm({
    resolver: yupResolver(silverSchema),
    defaultValues: {
      purity: defaultValues?.purity ?? undefined,
      pricePerGram: defaultValues?.pricePerGram ?? undefined,
    },
  })

  const { reset, handleSubmit } = methods

  useEffect(() => {
    if (defaultValues) {
      reset({
        purity: defaultValues?.purity ?? undefined,
        pricePerGram: defaultValues?.pricePerGram ?? undefined,
      })
    }
  }, [defaultValues, reset])

  return (
    <div className="space-y-6">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <FormAdminInputRow
              name="purity"
              label="Purity"
              type="number"
              required
            />

            <FormAdminInputRow
              name="pricePerGram"
              label="Price Per Gram"
              type="number"
              step="0.01"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              onClick={() => router.back()}
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
