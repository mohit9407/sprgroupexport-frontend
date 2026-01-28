'use client'

import { Suspense } from 'react'
import { useTableQueryParams, useDebouncedValue } from './utils'

function TableWithParams({ children }) {
  const tableQueryParams = useTableQueryParams()
  const debouncedValue = useDebouncedValue

  return children({ tableQueryParams, debouncedValue })
}

export function useTableQueryParamsWithSuspense() {
  return (
    <Suspense fallback={<div>Loading table parameters...</div>}>
      <TableWithParams>
        {({ tableQueryParams }) => tableQueryParams}
      </TableWithParams>
    </Suspense>
  )
}

export { useTableQueryParams, useDebouncedValue }
