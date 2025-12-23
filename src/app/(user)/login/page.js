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
      router.push(user.role === 'admin' ? '/admin' : '/')
    }
  }, [user, router])

  return <AuthForm isLogin={true} />
}
