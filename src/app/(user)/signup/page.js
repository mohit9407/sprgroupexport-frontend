'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import AuthForm from '@/components/Auth/AuthForm'

export default function SignupPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/')
    }
  }, [user, router])

  return <AuthForm isLogin={false} />
}
