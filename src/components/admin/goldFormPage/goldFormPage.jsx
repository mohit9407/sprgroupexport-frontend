'use client'

import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'

import { FormAdminInputRow } from '../AdminInputRow'

const goldSchema = yup.object({
  carat: yup
    .number()
    .typeError('Carat must be a number')
    .required('Carat is required'),

  pricePerGram: yup
    .number()
    .typeError('Price per gram must be a number')
    .required('Price per gram is required'),
})

export default function GoldForm({
  mode = 'add',
  defaultValues,
  title = 'Add Gold',
  onSubmit, // ✅ comes from page
}) {
  const router = useRouter()
  const isEditMode = mode === 'edit'

  const methods = useForm({
    resolver: yupResolver(goldSchema),
    defaultValues: {
      carat: defaultValues?.carat ?? undefined,
      pricePerGram: defaultValues?.pricePerGram ?? undefined,
    },
  })

  const { reset, handleSubmit } = methods

  useEffect(() => {
    if (defaultValues) {
      reset({
        carat: defaultValues?.carat ?? undefined,
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
              name="carat"
              label="Carat"
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
