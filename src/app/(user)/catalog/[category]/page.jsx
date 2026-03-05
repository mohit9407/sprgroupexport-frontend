'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CatalogCategoryPage({ params }) {
  const router = useRouter()

  // Rederect to shop with category parametertde
  useEffect(() => {
    router.replace(`/shop?category=${params.category}`)
  }, [params.category, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
