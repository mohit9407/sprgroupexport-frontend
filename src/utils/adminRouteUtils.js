export const ADMIN_PRODUCTS_LIST_PATH = '/admin/products'
export const ADMIN_CATEGORIES_LIST_PATH = '/admin/categories'
export const ADMIN_ORDERS_LIST_PATH = '/admin/orders'

const LIST_PATHS_WITH_QUERY_RESTORE = new Set([
  ADMIN_PRODUCTS_LIST_PATH,
  ADMIN_CATEGORIES_LIST_PATH,
  ADMIN_ORDERS_LIST_PATH,
])

export function getListReturnPath(listPath, searchParams) {
  const listQuery = searchParams?.get?.('listQuery')
  return listQuery ? `${listPath}?${listQuery}` : listPath
}

export function buildListDetailPath(listPath, detailPath, searchParams) {
  const listQuery = searchParams?.toString?.() || ''
  const base = `${listPath}/${detailPath}`
  if (!listQuery) return base
  return `${base}?listQuery=${encodeURIComponent(listQuery)}`
}

export function getBreadcrumbListHref(path, searchParams) {
  if (LIST_PATHS_WITH_QUERY_RESTORE.has(path)) {
    return getListReturnPath(path, searchParams)
  }

  return path
}

export function getProductsListReturnPath(searchParams) {
  return getListReturnPath(ADMIN_PRODUCTS_LIST_PATH, searchParams)
}

export function buildProductEditPath(productId, searchParams) {
  return buildListDetailPath(
    ADMIN_PRODUCTS_LIST_PATH,
    `edit/${productId}`,
    searchParams,
  )
}

export function getCategoriesListReturnPath(searchParams) {
  return getListReturnPath(ADMIN_CATEGORIES_LIST_PATH, searchParams)
}

export function buildCategoryEditPath(categoryId, searchParams) {
  return buildListDetailPath(
    ADMIN_CATEGORIES_LIST_PATH,
    `edit/${categoryId}`,
    searchParams,
  )
}

export function getOrdersListReturnPath(searchParams) {
  return getListReturnPath(ADMIN_ORDERS_LIST_PATH, searchParams)
}

export function buildOrderDetailPath(orderId, searchParams) {
  return buildListDetailPath(ADMIN_ORDERS_LIST_PATH, orderId, searchParams)
}

function matchPath(pattern = '', pathname = '') {
  const patternParts = pattern.split('/')
  const pathParts = pathname.split('/')

  if (patternParts.length !== pathParts.length) return false

  return patternParts.every((part, i) => {
    if (part.startsWith(':')) return true
    return part === pathParts[i]
  })
}

function findRouteMeta(pathname, routeMeta) {
  return routeMeta.find((route) => matchPath(route?.path, pathname))
}

export function buildBreadcrumbs(pathname, routeMeta) {
  const breadcrumbs = []

  let current = findRouteMeta(pathname, routeMeta)
  if (!current) return []

  while (current) {
    breadcrumbs.unshift({
      ...current,
      label: current.label,
      path: current.sidebar ? current.path : undefined,
    })

    current = current.parent
      ? routeMeta.find((r) => r.path === current.parent)
      : null
  }

  return breadcrumbs
}

export function getActiveRouteChain(pathname, routeMeta) {
  const find = (path) => routeMeta.find((r) => matchPath(r.path, path))

  let current = find(pathname)
  const chain = []

  while (current) {
    chain.push(current.path)
    current = current.parent ? find(current.parent) : null
  }

  return chain
}

export function getDeepestActivePath(activePaths) {
  return activePaths[0]
}

export function Arrow({ open, collapsed }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200
        ${open ? 'rotate-90' : ''}
        ${collapsed ? 'hidden' : 'block'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M7.21 14.77a.75.75 0 010-1.06L10.94 10 7.21 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.06 0z" />
    </svg>
  )
}

export const getSidebarMenuData = (routeMeta, userRole = 'user') => {
  const addedPaths = []
  return routeMeta.reduce((menu, route) => {
    if (addedPaths.includes(route.path)) {
      return menu
    }

    // Check if route has role restrictions
    if (route.roles && !route.roles.includes(userRole)) {
      return menu
    }

    if (route?.sidebar && route?.path && !route?.sidebarChildrens?.length) {
      addedPaths.push(route.path)
      menu.push(route)
      return menu
    }

    if (route?.sidebarChildrens) {
      // Filter children based on role
      const filteredChildren = route.sidebarChildrens
        .map((path) => {
          addedPaths.push(path)
          return routeMeta.find((route) => route.path === path)
        })
        .filter((child) => {
          // If child has role restrictions, check if user has access
          if (child.roles && !child.roles.includes(userRole)) {
            return false
          }
          return true
        })

      // Only add parent if it has children after filtering
      if (filteredChildren.length > 0) {
        menu.push({
          ...route,
          childrens: filteredChildren,
        })
      }
      return menu
    }

    return menu
  }, [])
}
