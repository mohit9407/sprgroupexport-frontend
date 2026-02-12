import { Arrow, getDeepestActivePath } from '@/utils/adminRouteUtils'
import Link from 'next/link'

export function SidebarItem({
  item,
  collapsed,
  open,
  toggle,
  activePaths,
  pathname,
}) {
  const deepestActivePath = getDeepestActivePath(activePaths)

  if (item.childrens?.length) {
    return (
      <div>
        <div
          className={`w-full flex items-center justify-between px-3 py-2 rounded
          hover:bg-slate-800`}
        >
          <Link
            href={item.path || '#'}
            className="flex items-center gap-2 flex-1"
          >
            {item?.icon && (
              <item.icon className="mr-2 w-4 h-4 text-slate-300" />
            )}
            {!collapsed && item.label}
          </Link>

          <button onClick={() => toggle(item.key)} className="p-1">
            <Arrow open={open} collapsed={collapsed} />
          </button>
        </div>

        {open && !collapsed && (
          <div className="ml-3 space-y-1">
            {item.childrens.map((child) => {
              const active = child.path === deepestActivePath

              return (
                <Link
                  key={child.key}
                  href={child.path}
                  className={`flex items-center px-3 py-1.5 rounded hover:bg-slate-800
                  ${active ? 'bg-slate-800 text-white' : 'text-slate-300'}`}
                >
                  {child.icon && (
                    <child.icon className="mr-2 w-4 h-4 text-slate-300" />
                  )}
                  {child.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  function isSidebarItemActive(itemHref, pathname, activePaths) {
    if (itemHref === '/admin') {
      return pathname === '/admin'
    }

    return activePaths.includes(itemHref)
  }

  const active =
    item.path && isSidebarItemActive(item.path, pathname, activePaths)

  return (
    <Link
      href={item.path || '#'}
      className={`flex items-center gap-2 px-3 py-2 rounded
      hover:bg-slate-800 ${active ? 'bg-slate-800' : ''}`}
    >
      {item?.icon && <item.icon className="mr-2 w-4 h-4 text-slate-300" />}
      {!collapsed && item.label}
    </Link>
  )
}
