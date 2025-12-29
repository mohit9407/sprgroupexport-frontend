'use client'

import { useState } from 'react'
import AdminHeader from '@/components/admin/Header'
import AdminSidebar from '@/components/admin/Sidebar'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  const menu = [
    { key: 'dashboard', label: 'Dashboard', href: '/admin' },
    {
      key: 'media',
      label: 'Media',
      children: [
        { key: 'media', label: 'Media', href: '/admin/media' },
        {
          key: 'media-settings',
          label: 'Media Settings',
          href: '/admin/media/media-settings',
        },
      ],
    },
    { key: 'customers', label: 'Customers', href: '/admin/customers' },
    {
      key: 'catalog',
      label: 'Catalog',
      children: [
        {
          key: 'categories',
          label: 'Categories',
          href: '/admin/categories/display',
        },
        {
          key: 'attributes',
          label: 'Products Attributes',
          href: '/admin/attributes',
        },
        { key: 'products', label: 'Products', href: '/admin/products' },
        { key: 'inventory', label: 'Inventory', href: '/admin/inventory' },
        { key: 'bulk', label: 'Bulk Upload', href: '/admin/bulk-upload' },
        { key: 'reviews', label: 'Reviews', href: '/admin/reviews' },
      ],
    },
    { key: 'orders', label: 'Orders', href: '/admin/orders' },
    { key: 'reports', label: 'Reports', href: '/admin/reports' },
    { key: 'coupons', label: 'Coupons', href: '/admin/coupons' },
    {
      key: 'shipping',
      label: 'Shipping Methods',
      href: '/admin/shipping-methods',
    },
    {
      key: 'payment',
      label: 'Payment Methods',
      href: '/admin/payment-methods',
    },
    {
      key: 'general',
      label: 'General Settings',
      href: '/admin/settings/general',
    },
    {
      key: 'website',
      label: 'Settings (Website)',
      href: '/admin/settings/website',
    },
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Admin"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }]}
        user={user}
        onToggleSidebar={() => setCollapsed((v) => !v)}
      />
      <div className="flex">
        <AdminSidebar collapsed={collapsed} menu={menu} />
        <main className="flex-1 p-4 bg-gray-100 min-h-[calc(100vh-48px)]">
          <div className="bg-white rounded shadow p-4">{children}</div>
        </main>
      </div>
    </div>
  )
}
