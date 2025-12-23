import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { forgotPassword, resetForgotPasswordState } from '../authSlice'
import { toast } from '@/utils/toastConfig'

export const useForgotPassword = () => {
  const [email, setEmail] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()

  const { loading, success, error } = useSelector(
    (state) => state.auth.forgotPassword,
  )

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      const result = await dispatch(forgotPassword(email)).unwrap()
      if (result) {
        toast.success('OTP sent to your email')
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
      }
    } catch (error) {
      toast.error(error || 'Failed to send OTP')
    }
  }

  const resetState = () => {
    dispatch(resetForgotPasswordState())
    setEmail('')
  }

  return {
    email,
    loading,
    success,
    error,
    handleEmailChange,
    handleSubmit,
    resetState,
  }
}
