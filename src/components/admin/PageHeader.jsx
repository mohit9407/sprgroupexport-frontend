'use client'

import { Suspense } from 'react'
import { routeMeta } from '@/config/adminRoutes'
import {
  buildBreadcrumbs,
  getBreadcrumbListHref,
} from '@/utils/adminRouteUtils'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

function PageHeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const breadcrumbs = buildBreadcrumbs(pathname, routeMeta)
  const current = breadcrumbs.at(-1)

  return (
    <div className="mb-4 pb-3">
      <div className="lg:flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {current?.label}
          {current?.description && (
            <span className="ml-2 text-sm text-gray-500">
              {current.description}
            </span>
          )}
        </h2>

        <div className="text-xs text-gray-600 bg-gray-300 rounded p-2 lg:bg-transparent lg:p-0">
          {breadcrumbs.map((b, i) => {
            const isLast = i === breadcrumbs.length - 1
            const href = b.path
              ? getBreadcrumbListHref(b.path, searchParams)
              : null
            const isLink = href && !isLast

            return (
              <span key={i}>
                {i !== 0 && <span className="px-1.5">{'>'}</span>}
                {isLink ? (
                  <Link href={href} className="hover:underline">
                    {b.icon && (
                      <b.icon className="inline-flex mr-1 w-4 h-4 text-gray-600" />
                    )}
                    {b.label}
                  </Link>
                ) : (
                  <span className="cursor-not-allowed">{b.label}</span>
                )}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function PageHeader() {
  return (
    <Suspense fallback={null}>
      <PageHeaderContent />
    </Suspense>
  )
}
