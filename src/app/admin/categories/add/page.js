'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import CategoryFormPage from '@/components/admin/CategoryFormPage/CategoryFormPage'

function AddCategoryContent() {
  const dispatch = useDispatch()
  const { categories } = useSelector((state) => state.categories)

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchAllCategories())
    }
  }, [dispatch, categories])

  return (
    <div className="container mx-auto px-4 py-6">
      <CategoryFormPage mode="add" title="Add New Category" />
    </div>
  )
}

export default function AddCategoryPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-6">Loading...</div>}
    >
      <AddCategoryContent />
    </Suspense>
  )
}
