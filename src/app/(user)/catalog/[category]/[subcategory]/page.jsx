'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CatalogSubcategoryPage({ params }) {
  const router = useRouter()

  // Redirect to shop with category and subcategory parameters
  useEffect(() => {
    router.replace(
      `/shop?category=${params.category}&subcategory=${params.subcategory}`,
    )
  }, [params.category, params.subcategory, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
