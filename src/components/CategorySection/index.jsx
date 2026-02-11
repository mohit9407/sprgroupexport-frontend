'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import CategoryCard from '../CategoryCard'
import {
  fetchAllCategories,
  selectAllCategories,
  selectCategoriesStatus,
  selectCategoriesError,
} from '@/features/categories/categoriesSlice'

const CategorySection = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const categoriesData = useSelector(selectAllCategories)
  const status = useSelector(selectCategoriesStatus)
  const error = useSelector(selectCategoriesError)

  const handleCategoryClick = (category) => {
    // Navigate to shop with category filter
    router.push(`/shop?category=${category.slug}`)
  }

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAllCategories())
    }
  }, [status, dispatch])

  // Map API response to match CategoryCard props
  const mappedCategories = categoriesData?.data
    ? categoriesData.data
        .filter((category) => !category.parent) // Only include categories with no parent
        .map((category) => ({
          id: category._id,
          title: category.name?.toUpperCase() || 'CATEGORY',
          image: category.image || '/bg1.jpg',
          slug: category.slug,
          onClick: () => handleCategoryClick(category),
        }))
    : []

  // Show loading state
  if (status === 'loading') {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-3xl font-bold text-center mb-12 uppercase tracking-wider text-gray-800">
          LOADING CATEGORIES...
        </div>
      </section>
    )
  }

  // Show error state
  if (status === 'failed') {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-3xl font-bold text-center mb-12 uppercase tracking-wider text-red-600">
          Error: {error || 'Failed to load categories'}
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-3xl font-bold text-center mb-12 uppercase tracking-wider text-gray-800">
        PRODUCT CATEGORIES
      </div>
      <div className="w-full">
        {mappedCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {mappedCategories.map((category) => (
              <div key={category.id} className="w-full">
                <CategoryCard
                  title={category.title}
                  imageUrl={category.image.mediumUrl}
                  href={`/shop?category=${category.id}`}
                  onClick={category.onClick}
                  className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories found</p>
            <p className="text-gray-400 mt-2">Check back later for updates</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CategorySection
