'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setIsClient(true), 0)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push('/login')
    }
  }, [user, loading, isClient, router])

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return children
}
