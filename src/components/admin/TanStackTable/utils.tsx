'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'

export function useTableQueryParams() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const params = useMemo(() => {
    return {
      pageIndex: Number(searchParams.get('page') || 1) - 1,
      pageSize: Number(searchParams.get('pageSize') || 10),
      search: searchParams.get('search') || '',
      filterBy: searchParams.get('filterBy') || '',
      sortBy: searchParams.get('sortBy'),
      direction: searchParams.get('direction'),
    }
  }, [searchParams])

  const setParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const sp = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') sp.delete(key)
        else sp.set(key, String(value))
      })

      router.push(`?${sp.toString()}`)
    },
    [router, searchParams],
  )

  return { params, setParams }
}

export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
