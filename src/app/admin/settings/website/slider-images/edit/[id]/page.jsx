'use client'

import SliderImagesFormPage from '@/components/admin/SliderImagesFormPage/SliderImagesFormPage'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import { clearSliderImages } from '@/features/slider-images/sliderImagesSlice'
import { fetchByIdSliderImages } from '@/features/slider-images/sliderImagesSlice'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function EditSliderImagesPage() {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    data: sliderImage,
    isLoading,
    error,
  } = useSelector((state) => state.slider.getByIdSliderImages)

  const { categories } = useSelector((state) => state.categories)

  useEffect(() => {
    if (id) {
      dispatch(fetchByIdSliderImages(id))
    }

    return () => {
      dispatch(clearSliderImages())
    }
  }, [dispatch, id, router])

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchAllCategories())
    }
  }, [dispatch, categories])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading slider image...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading sliderImage: {error}
              </p>
              <button
                onClick={() =>
                  router.push('/admin/settings/website/slider-images')
                }
                className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm"
              >
                Back to sliderImage
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!sliderImage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Slide Image Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The requested sliderImage could not be found or may have been
            removed.
          </p>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            Back to sliderImage
          </button>
        </div>
      </div>
    )
  }

  const defaultValues = {
    _id: sliderImage._id,
    language: sliderImage.language,
    sliderType: sliderImage.sliderType,
    sliderImage: sliderImage.sliderImage,
    sliderNavigation: sliderImage.sliderNavigation,
    category: sliderImage.category,
    expiryDate: sliderImage.expiryDate
      ? new Date(sliderImage.expiryDate).toISOString().split('T')[0]
      : '',
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <SliderImagesFormPage
        mode="edit"
        productId={id}
        defaultValues={defaultValues}
        title={`Edit sliderImage`}
      />
    </div>
  )
}
