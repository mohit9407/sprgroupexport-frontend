'use client'

import { useState } from 'react'
import AdminHeader from '@/components/admin/Header'
import AdminSidebar from '@/components/admin/Sidebar'
import PageHeader from '@/components/admin/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { routeMeta } from '@/config/adminRoutes'
import { getSidebarMenuData } from '@/utils/adminRouteUtils'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const menu = getSidebarMenuData(routeMeta)

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Admin"
        user={user}
        onToggleSidebar={() => setCollapsed((v) => !v)}
      />

      <div className="flex">
        <AdminSidebar collapsed={collapsed} menu={menu} />
        <main className="flex-1 p-4 bg-gray-100 min-h-[calc(100vh-48px)]">
          <PageHeader menu={menu} />
          <div className="bg-white rounded shadow p-4">{children}</div>
        </main>
      </div>
    </div>
  )
}
