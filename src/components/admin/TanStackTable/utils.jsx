'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'

export function useTableQueryParams() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const params = useMemo(() => {
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 10)

    return {
      pageIndex: page - 1,
      pageSize,
      sortBy: searchParams.get('sortBy'),
      direction: searchParams.get('direction'),
      filterBy: searchParams.get('filterBy') ?? '',
      search: searchParams.get('search') ?? '',
    }
  }, [searchParams])

  const setParams = useCallback(
    (next) => {
      const sp = new URLSearchParams(searchParams.toString())
      let changed = false

      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === '' || value === undefined) {
          if (sp.has(key)) {
            sp.delete(key)
            changed = true
          }
        } else if (sp.get(key) !== String(value)) {
          sp.set(key, String(value))
          changed = true
        }
      })

      if (!changed) return

      router.replace(`?${sp.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  return { params, setParams }
}

export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
