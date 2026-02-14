'use client'

import SliderImagesFormPage from '@/components/admin/SliderImagesFormPage/SliderImagesFormPage'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function AddSliderimages() {
  const dispatch = useDispatch()
  const { categories } = useSelector((state) => state.categories)

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchAllCategories())
    }
  }, [dispatch, categories])

  return (
    <div className="container mx-auto px-4 py-6">
      <SliderImagesFormPage mode="add" title="Add New Slider Image" />
    </div>
  )
}
