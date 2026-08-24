'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import ProductFormPage from '@/components/admin/ProductFormPage/ProductFormPage'

function AddProductContent() {
  const dispatch = useDispatch()
  const { categories } = useSelector((state) => state.categories)

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchAllCategories())
    }
  }, [dispatch, categories])

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductFormPage mode="add" title="Add New Product" />
    </div>
  )
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-6">Loading...</div>}
    >
      <AddProductContent />
    </Suspense>
  )
}
