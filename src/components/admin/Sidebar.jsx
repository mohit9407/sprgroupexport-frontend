'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { routeMeta } from '@/config/adminRoutes'
import { getActiveRouteChain } from '@/utils/adminRouteUtils'
import { SidebarItem } from './SidebarItem'

export default function AdminSidebar({ collapsed = false, menu = [] }) {
  const pathname = usePathname()
  const activePaths = getActiveRouteChain(pathname, routeMeta)

  const [open, setOpen] = useState({})

  useEffect(() => {
    const next = {}
    menu.forEach((item) => {
      if (item.childrens?.some((child) => activePaths.includes(child.path))) {
        next[item.key] = true
      }
    })
    ;(() => {
      if (JSON.stringify(next) !== JSON.stringify(open)) {
        setOpen(next)
      }
    })()
  }, [pathname, menu])

  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }))

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'min-w-64 w-64'}
      transition-all duration-200 bg-slate-900 text-slate-100
      h-[calc(100vh-48px)] sticky top-12 overflow-y-auto`}
    >
      <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-400">
        Navigation
      </div>

      <nav className="px-2 pb-4 space-y-1">
        {menu.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            collapsed={collapsed}
            open={open[item.key]}
            toggle={toggle}
            activePaths={activePaths}
            pathname={pathname}
          />
        ))}
      </nav>
    </aside>
  )
}
