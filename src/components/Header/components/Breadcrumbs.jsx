'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const Breadcrumbs = ({ productName }) => {
  const pathname = usePathname()

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('?')[0].split('/').filter(Boolean)

    const breadcrumbs = []
    let url = ''

    breadcrumbs.push({
      label: 'Home',
      href: '/',
      isLast: pathSegments.length === 0,
    })

    if (pathname === '/') {
      return breadcrumbs
    }

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1

      // Skip empty segments
      if (!segment) return

      url += `/${segment}`

      let label = segment

      // If this is an order ID, show "Product Details" instead
      if (
        isLast &&
        pathname.includes('/orders/') &&
        /^[0-9a-fA-F]{24}$/.test(segment)
      ) {
        label = 'Order Details'
      }
      // If this is a product ID and we have a product name from URL params, use that
      else if (isLast && productName && /^[0-9a-fA-F]{24}$/.test(segment)) {
        label = decodeURIComponent(productName)
      } else if (!/^\d+$/.test(segment)) {
        // Only format non-numeric segments
        label = segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      } else {
        // Skip numeric segments that aren't product IDs
        return
      }

      breadcrumbs.push({
        label,
        href: url,
        isLast,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <div className="bg-[#dbdbdb] py-2 px-4 border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-sm text-gray-600 flex items-center p-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              {index > 0 && <span className="mx-2">»</span>}
              {breadcrumb.isLast ? (
                <span className="text-gray-700 font-medium">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="hover:text-[#BA8B4E] transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Breadcrumbs
