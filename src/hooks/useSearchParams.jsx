'use client'

import { Suspense } from 'react'
import { useSearchParams as useNextSearchParams } from 'next/navigation'

function SearchParamsWrapper({ children }) {
  const searchParams = useNextSearchParams()
  return children(searchParams)
}

export function useSearchParams() {
  return (
    <Suspense fallback={null}>
      <SearchParamsWrapper>
        {(searchParams) => searchParams}
      </SearchParamsWrapper>
    </Suspense>
  )
}

export default useSearchParams
