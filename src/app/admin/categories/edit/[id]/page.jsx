'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategoryById } from '@/features/categories/categoryDetailsSlice'
import CategoryFormPage from '@/components/admin/CategoryFormPage/CategoryFormPage'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'

export default function EditCategoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    data: category,
    status,
    error,
  } = useSelector((state) => state.categoryDetails)
  const { categories } = useSelector((state) => state.categories)

  useEffect(() => {
    if (id) {
      dispatch(fetchCategoryById(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchAllCategories())
    }
  }, [dispatch, categories])

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
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return <div>Category not found</div>
  }

  // Prepare default values for the form
  const defaultValues = {
    parentId: category.parent || '',
    name: category.name || '',
    status: category.status || 'active',
    image: category.image || '',
    icon: category.icon || '',
  }

  return (
    <CategoryFormPage
      mode="edit"
      categoryId={id}
      defaultValues={defaultValues}
      title={`Edit Category: ${category.name}`}
    />
  )
}
