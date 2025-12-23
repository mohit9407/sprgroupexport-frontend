'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import ResetPasswordForm from '@/components/Auth/ResetPasswordForm'
import { resetPassword, resetAuthState } from '@/features/auth/authSlice'
import { toast } from '@/utils/toastConfig'

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const email = searchParams.get('email')

  const { loading, error, success } = useSelector((state) => ({
    loading: state.auth.loading,
    error: state.auth.error,
    success: state.auth.success,
  }))

  useEffect(() => {
    dispatch(resetAuthState())

    if (!email) {
      toast.error('Invalid reset link')
      router.push('/forgot-password')
    }

    return () => {}
  }, [dispatch, email, router])

  useEffect(() => {
    if (success) {
      toast.success('Password reset successfully')
      router.push('/login?reset=success')
    }
  }, [success, router])

  const handleResetPassword = async ({ password, confirmPassword }) => {
    if (!email) {
      toast.error('Email is required')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      await dispatch(resetPassword({ email, newPassword: password })).unwrap()
    } catch (error) {
      toast.error(error || 'Failed to reset password')
    }
  }

  const handleBack = () => {
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ResetPasswordForm
          email={email}
          onSubmit={handleResetPassword}
          onBack={handleBack}
          isLoading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
