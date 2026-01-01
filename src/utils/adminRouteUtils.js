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

export const getSidebarMenuData = (routeMeta) => {
  const addedPaths = []
  return routeMeta.reduce((menu, route) => {
    if (addedPaths.includes(route.path)) {
      return menu
    }

    if (route?.sidebar && route?.path && !route?.sidebarChildrens?.length) {
      addedPaths.push(route.path)
      menu.push(route)
      return menu
    }

    if (route?.sidebarChildrens) {
      menu.push({
        ...route,
        childrens: route.sidebarChildrens.map((path) => {
          addedPaths.push(path)
          return routeMeta.find((route) => route.path === path)
        }),
      })
      return menu
    }

    return menu
  }, [])
}
