'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function AdminHeader({
  title = 'Admin',
  actions = [],
  user,
  onToggleSidebar,
}) {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full bg-sky-700 text-white shadow">
      <div className="flex items-center h-12 px-4 gap-3">
        <button
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-sky-600 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="font-semibold">{title}</div>
        <div className="ml-auto flex items-center gap-2">
          {actions.map((Action, idx) => (
            <Action key={idx} />
          ))}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-sky-600"
              onClick={() => setOpen((v) => !v)}
            >
              <div className="h-6 w-6 rounded-full bg-white/20 grid place-items-center">
                <span className="text-xs font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-sm">{user?.email || 'Admin'}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 mt-1 w-48 bg-white text-gray-700 rounded shadow">
                <Link
                  href="/admin"
                  className="block px-3 py-2 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/account"
                  className="block px-3 py-2 hover:bg-gray-100"
                >
                  Account Settings
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
