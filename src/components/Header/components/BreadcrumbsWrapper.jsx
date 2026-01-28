'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Breadcrumbs from './Breadcrumbs'

function BreadcrumbsWithParams() {
  const searchParams = useSearchParams()
  const productName = searchParams.get('name')

  return <Breadcrumbs productName={productName} />
}

export default function BreadcrumbsWrapper() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#dbdbdb] py-2 px-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-sm text-gray-600 flex items-center p-2">
              <span className="text-gray-700 font-medium">Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <BreadcrumbsWithParams />
    </Suspense>
  )
}
