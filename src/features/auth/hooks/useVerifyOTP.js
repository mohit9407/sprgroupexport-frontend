'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { verifyOTP, resetVerifyOTPState, resendOTP } from '../authSlice'
import { toast } from '@/utils/toastConfig'

export function useVerifyOTP() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const email = searchParams.get('email')

  const { loading, error, success } = useSelector(
    (state) => state.auth.verifyOTP,
  )
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password')
    }

    dispatch(resetVerifyOTPState())

    return () => {
      // Cleanup on unmount if needed
    }
  }, [dispatch, email, router])

  useEffect(() => {
    if (success) {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    }
  }, [success, email, router])

  const handleVerify = async (otp) => {
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    if (!email) {
      toast.error('Email is required')
      return
    }

    try {
      await dispatch(verifyOTP({ email, otp })).unwrap()
      toast.success('OTP verified successfully')
    } catch (error) {
      toast.error(error || 'Failed to verify OTP')
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Email is required')
      return
    }

    setIsResending(true)
    setResendSuccess(false)

    try {
      await dispatch(resendOTP({ email })).unwrap()
      setResendSuccess(true)
      toast.success('OTP resent successfully')
    } catch (error) {
      toast.error(error || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  const handleBack = () => {
    router.push('/forgot-password')
  }

  return {
    email,
    loading,
    error,
    isResending,
    resendSuccess,
    handleVerify,
    handleResend,
    handleBack,
  }
}
