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
  const iconClass = 'w-5 h-5 shrink-0 text-slate-300'

  if (item.childrens?.length) {
    return (
      <div>
        <div
          className={`w-full flex items-center rounded hover:bg-slate-800
          ${collapsed ? 'justify-center px-0 py-2' : 'justify-between px-3 py-2'}`}
        >
          <Link
            href={item.path || '#'}
            title={item.label}
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'gap-2 flex-1'
            }`}
          >
            {item?.icon && <item.icon className={iconClass} />}
            {!collapsed && item.label}
          </Link>

          {!collapsed && (
            <button onClick={() => toggle(item.key)} className="p-1">
              <Arrow open={open} collapsed={collapsed} />
            </button>
          )}
        </div>

        {open && !collapsed && (
          <div className="ml-3 space-y-1">
            {item.childrens.map((child) => {
              const active = child.path === deepestActivePath

              return (
                <Link
                  key={child.key}
                  href={child.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-slate-800
                  ${active ? 'bg-slate-800 text-white' : 'text-slate-300'}`}
                >
                  {child.icon && <child.icon className={iconClass} />}
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
      title={item.label}
      className={`flex items-center gap-2 py-2 rounded hover:bg-slate-800
      ${collapsed ? 'justify-center px-0' : 'px-3'}
      ${active ? 'bg-slate-800' : ''}`}
    >
      {item?.icon && <item.icon className={iconClass} />}
      {!collapsed && item.label}
    </Link>
  )
}
