'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import ChangePasswordForm from '@/components/Auth/ChangePasswordForm'
import {
  changePassword,
  resetChangePasswordState,
} from '@/features/auth/authSlice'
import toast from 'react-hot-toast'

export default function ChangePasswordPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const { loading, error, success } = useSelector((state) => ({
    loading: state.auth.changePassword.loading,
    error: state.auth.changePassword.error,
    success: state.auth.changePassword.success,
  }))

  useEffect(() => {
    // Reset the change password state when component mounts
    dispatch(resetChangePasswordState())

    return () => {
      // Clean up when component unmounts
      dispatch(resetChangePasswordState())
    }
  }, [dispatch])

  useEffect(() => {
    if (success) {
      toast.success('Password changed successfully')
      router.push('/account')
    }
  }, [success, router])

  const handleChangePassword = async ({
    oldPassword,
    newPassword,
    confirmPassword,
  }) => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap()
      toast.success('Password changed successfully')
      router.push('/account')
    } catch (error) {
      // Error is already handled by the slice, just log it
      console.error('Password change failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChangePasswordForm
        onSubmit={handleChangePassword}
        isLoading={loading}
        error={error}
      />
    </div>
  )
}
