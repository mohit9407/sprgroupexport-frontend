import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { FormAdminInputRow } from '../AdminInputRow'
import { FormAdminSelect } from '../AdminSelect'
import {
  createSliderImages,
  updateSliderImages,
} from '@/features/slider-images/sliderImagesSlice'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import { toast } from '@/utils/toastConfig'

const sliderImageSchema = yup.object().shape({
  language: yup.string().optional(),
  sliderType: yup.string().optional(),
  sliderNavigation: yup.string().optional(),
  category: yup.string().optional(),
  expiryDate: yup.string().optional(),
})

const SliderImagesFormPage = ({
  mode = 'add',
  defaultValues,
  title = 'Add Slider Image',
}) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const isEditMode = mode === 'edit'

  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [existingImage, setExistingImage] = useState(
    defaultValues?.sliderImage || '',
  )

  const methods = useForm({
    resolver: yupResolver(sliderImageSchema),
    defaultValues: {
      language: defaultValues?.language ?? '',
      sliderType: defaultValues?.sliderType ?? '',
      sliderImage: null,
      sliderNavigation: defaultValues?.sliderNavigation ?? '',
      category: defaultValues?.category ?? '',
      expiryDate: defaultValues?.expiryDate ?? '',
    },
  })

  const {  handleSubmit, formState, setValue } = methods

  const handleFileChange = (name, file) => {
    if (name === 'sliderImage') {
      setSelectedImage(file)
      setValue('sliderImage', file)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const formData = new FormData()

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          if (key !== 'sliderImage') {
            formData.append(key, data[key])
            console.log(`Appending ${key}:`, data[key])
          }
        }
      })

      if (selectedImage && selectedImage instanceof File) {
        formData.append('sliderImage', selectedImage)
        console.log('Appending selectedImage file:', selectedImage.name)
      } else {
        console.log('No new image file selected; skipping sliderImage append')
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }

      let result
      if (isEditMode) {

        try {
          result = await dispatch(
            updateSliderImages({
              id: defaultValues._id,
              params: formData,
            }),
          ).unwrap()

          toast.success('Slider Image updated successfully! 🎉')
        } catch (updateError) {

          if (
            updateError?.message?.includes('success') ||
            updateError?.data?.message?.includes('success')
          ) {
            toast.success('Slider Image updated successfully! 🎉')
          } else {
            throw updateError
          }
        }
      } else {

        try {
          result = await dispatch(createSliderImages(formData)).unwrap()

          console.log('Create result:', result)
          toast.success('Slider Image created successfully! 🎉')
        } catch (createError) {
         
          if (
            createError?.message?.includes('success') ||
            createError?.data?.message?.includes('success')
          ) {
            toast.success('Slider Image created successfully! 🎉')
          } else {
            throw createError
          }
        }
      }

      // Redirect to list page after successful operation
      setTimeout(() => {
        router.push('/admin/settings/website/slider-images')
      }, 1500)
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage =
        error?.message || error?.data?.message || 'Failed to save slider image'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Get categories from Redux store
  const { allCategories } = useSelector((state) => state.categories)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [formattedCategories, setFormattedCategories] = useState([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)

        if (allCategories?.data?.length > 0) {
          const categoriesData = Array.isArray(allCategories.data)
            ? allCategories.data
            : allCategories.data.data || []

          const formatted = categoriesData.map((category) => ({
            label: category.name,
            value: category._id,
          }))

          setFormattedCategories(formatted)
        } else {

          const response = await dispatch(fetchAllCategories({ limit: 1000 }))
          if (response.payload?.data) {
            const categoriesData = Array.isArray(response.payload.data)
              ? response.payload.data
              : response.payload.data.data || []

            const formatted = categoriesData.map((category) => ({
              label: category.name,
              value: category._id,
            }))

            setFormattedCategories(formatted)
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [dispatch, allCategories])

  return (
    <div className="space-y-6">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <FormAdminInputRow name="language" label="Language" type="string" />

            <FormAdminSelect
              name="sliderType"
              label="Slider Type"
              options={[
                {
                  label: 'Full Screen Slider (1600x420)',
                  value: 'Full Screen Slider (1600x420)',
                },
                {
                  label: 'Full Page Slider (1170x420)',
                  value: 'Full Page Slider (1170x420)',
                },
                {
                  label: 'Right Slider with Thumbs (770x400)',
                  value: 'Right Slider with Thumbs (770x400)',
                },
                {
                  label: 'Right Slider with Navigation (770x400)',
                  value: 'Right Slider with Navigation (770x400)',
                },
                {
                  label: 'Left Slider with Thumbs (770x400)',
                  value: 'Left Slider with Thumbs (770x400)',
                },
              ]}
            />

            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                Slider Image <span className="text-red-500">*</span>
              </label>
              <div className="col-span-12 md:col-span-9">

                {existingImage && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Existing Image:
                    </p>
                    <img
                      src={existingImage}
                      alt="Existing slider"
                      className="h-32 w-32 object-cover rounded"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  onChange={(e) =>
                    handleFileChange('sliderImage', e.target.files?.[0])
                  }
                />

                {selectedImage && (
                  <div className="mt-4 mb-5">
                    <p className="text-sm text-gray-500 mb-2">
                      Selected Image:
                    </p>
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected slider"
                      className="h-32 w-32 object-cover rounded"
                    />
                  </div>
                )}

                {formState.errors.sliderImage && (
                  <p className="text-red-500 text-sm mt-1">
                    {formState.errors.sliderImage.message}
                  </p>
                )}
              </div>
            </div>

            <FormAdminSelect
              name="sliderNavigation"
              label="Slider Navigation"
              options={[
                {
                  label: 'Category',
                  value: 'Category',
                },
                {
                  label: 'Product',
                  value: 'Product',
                },
                {
                  label: 'Top Seller',
                  value: 'Top Seller',
                },
                {
                  label: 'Deals',
                  value: 'Deals',
                },
                {
                  label: 'Most Liked',
                  value: 'Most Liked',
                },
              ]}
            />

            <FormAdminSelect
              name="category"
              label="Category"
              options={formattedCategories}
            />
            <FormAdminInputRow
              name="expiryDate"
              label="Expiry Date"
              type="date"
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
              disabled={isLoading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default SliderImagesFormPage
