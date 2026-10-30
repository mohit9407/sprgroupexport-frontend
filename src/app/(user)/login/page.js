'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import AuthForm from '@/components/Auth/AuthForm'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      // Redirect admin and employer to admin panel
      if (
        user.role === 'admin' ||
        user.role === 'employer' ||
        user.isAdmin ||
        user.isEmployer
      ) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [user, router])

  return <AuthForm isLogin={true} />
}
