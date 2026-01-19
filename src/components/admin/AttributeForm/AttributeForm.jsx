'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormAdminInputRow } from '../AdminInputRow'
import * as yup from 'yup'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/utils/toastConfig'
import { useDispatch } from 'react-redux'
import {
  createAttribute,
  updateAttribute,
} from '@/features/attributes/attributesSlice'

const attributeSchema = yup.object({
  name: yup.string().required('Attribute name is required'),
  values: yup
    .array()
    .of(
      yup.object({
        value: yup.string().required('Value is required'),
      }),
    )
    .min(1, 'At least one value is required'),
})

export default function AttributeForm({ mode = 'add', initialData = null }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState(
    initialData?.values?.map((v) => ({
      id: v._id,
      value: v.value,
      isNew: false,
    })) || [],
  )
  const [bulkValues, setBulkValues] = useState('')

  const methods = useForm({
    resolver: yupResolver(attributeSchema),
    defaultValues: {
      name: initialData?.name || '',
      values: values,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods

  useEffect(() => {
    setValue('values', values)
  }, [values, setValue])

  const addValue = () => {
    setValues([...values, { id: 'new-' + Date.now(), value: '', isNew: true }])
  }

  const addBulkValues = () => {
    if (!bulkValues.trim()) return

    // Split by both newlines and commas, then flatten and trim
    const newValues = bulkValues
      .split(/[\n,]+/) // Split by newline or comma
      .map((v) => v.trim())
      .filter(
        (v) =>
          v &&
          !values.some(
            (existing) => existing.value.toLowerCase() === v.toLowerCase(),
          ),
      )
      .map((value) => ({
        id: 'new-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        value,
        isNew: true,
      }))

    setValues([...values, ...newValues])
    setBulkValues('')
  }

  const removeValue = (id) => {
    setValues(values.filter((item) => item.id !== id))
  }

  const updateValue = (index, value) => {
    const newValues = [...values]
    newValues[index] = {
      ...newValues[index],
      value,
      // If this was a new value and now it's being edited, keep it as new
      isNew: newValues[index].isNew !== false,
    }
    setValues(newValues)
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      if (mode === 'edit' && initialData?._id) {
        // For edit mode, prepare the payload for bulk update
        const existingValues = values.filter((v) => !v.isNew)
        const newValues = values.filter((v) => v.isNew).map((v) => v.value)
        const removedValues = initialData.values
          .filter((v) => !values.some((ev) => !ev.isNew && ev.id === v._id))
          .map((v) => v._id)

        // Find values that were updated (existing values that changed)
        const updatedValues = existingValues.reduce((acc, ev) => {
          const initialValue = initialData.values.find(
            (iv) => iv._id === ev.id,
          )?.value
          if (initialValue !== undefined && initialValue !== ev.value) {
            acc[ev.id] = ev.value
          }
          return acc
        }, {})

        const payload = {
          name: data.name,
          ...(newValues.length > 0 && { new_values: newValues }),
          ...(removedValues.length > 0 && { delete_values: removedValues }),
          ...(Object.keys(updatedValues).length > 0 && {
            values: updatedValues,
          }),
        }

        await dispatch(
          updateAttribute({ id: initialData._id, ...payload }),
        ).unwrap()
        toast.success('Attribute updated successfully')
      } else {
        // For add mode, use the array of strings format
        const valuesPayload = values.map((item) => item.value).filter(Boolean)

        const payload = {
          name: data.name,
          values: valuesPayload,
        }

        await dispatch(createAttribute(payload)).unwrap()
        toast.success('Attribute created successfully')
      }

      router.push('/admin/attributes')
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">
        {mode === 'edit' ? 'Edit' : 'Add New'} Attribute
      </h1>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <FormAdminInputRow
              label="Attribute Name"
              name="name"
              placeholder="e.g. Color, Size"
              register={register}
              error={errors.name}
              required
            />

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulk Add Values (one per line)
                </label>
                <div className="flex space-x-2">
                  <textarea
                    value={bulkValues}
                    onChange={(e) => setBulkValues(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter values separated by commas"
                  />
                  <button
                    type="button"
                    onClick={addBulkValues}
                    className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 self-start"
                  >
                    Add All
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Values <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addValue}
                  className="text-sm text-sky-600 hover:text-sky-800"
                >
                  + Add Single Value
                </button>
              </div>

              <div className="space-y-2">
                {values.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateValue(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder={
                        item.isNew ? 'Enter new value' : 'Update value'
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeValue(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {errors.values && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.values.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/attributes')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving...'
                  : mode === 'edit'
                    ? 'Update Attribute'
                    : 'Create Attribute'}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
