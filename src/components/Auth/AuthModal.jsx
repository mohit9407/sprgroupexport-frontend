'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiX, FiArrowLeft } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import {
  guestLogin,
  verifyGuestOTP,
  clearOtpError,
} from '@/features/auth/guestAuthSlice'
import { authService } from '@/features/auth/authService'
import { useAuth } from '@/context/AuthContext'

const OTP_LENGTH = 6

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [localOtpError, setLocalOtpError] = useState('')

  const dispatch = useDispatch()
  const {
    isLoading,
    isSuccess,
    isError,
    message,
    guestToken,
    guestEmail,
    otpError: reduxOtpError,
  } = useSelector((state) => state.guestAuth)

  // Combine local and redux OTP errors
  const otpError = localOtpError || reduxOtpError

  // Handle paste OTP
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()
    const otpDigits = pastedData
      .replace(/\D/g, '')
      .split('')
      .slice(0, OTP_LENGTH)

    if (otpDigits.length === OTP_LENGTH) {
      const newOtp = [...otp]
      otpDigits.forEach((digit, index) => {
        newOtp[index] = digit
      })
      setOtp(newOtp)

      // Focus on the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((digit) => !digit)
      const inputToFocus = document.querySelector(
        `input[data-index="${nextEmptyIndex === -1 ? OTP_LENGTH - 1 : nextEmptyIndex}"]`,
      )
      inputToFocus?.focus()
    }
  }

  // Handle OTP input change
  const handleOtpChange = (element, index) => {
    const value = element.target.value
    if (isNaN(value)) return false

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1) // Only allow one digit
    setOtp(newOtp)
    setLocalOtpError('')
    dispatch(clearOtpError())

    // Auto-focus next input
    if (
      value &&
      element.target.nextSibling &&
      element.target.nextSibling.tagName === 'INPUT'
    ) {
      element.target.nextSibling.focus()
    }
  }

  // Handle backspace in OTP input
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus()
    }
  }

  // Handle OTP verification
  const { login } = useAuth()

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')

    if (otpValue.length !== OTP_LENGTH) {
      setLocalOtpError('Please enter a valid 6-digit OTP')
      return
    }

    setIsVerifying(true)
    try {
      const result = await dispatch(verifyGuestOTP({ email, otp: otpValue }))
      if (verifyGuestOTP.fulfilled.match(result)) {
        // Get the user data from the response
        const { user, accessToken, refreshToken } = result.payload || {}
        if (user && accessToken) {
          // Login the user in the AuthContext
          login(user, { accessToken, refreshToken })
        }
        onClose()
      }
    } catch (error) {
      console.error('OTP verification failed:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  // Clear OTP error when switching between forms
  useEffect(() => {
    if (showOtpInput) {
      setLocalOtpError('')
      dispatch(clearOtpError())
    }
  }, [showOtpInput, dispatch])

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return

    try {
      setCanResend(false)
      setResendTimer(30)

      // Call the resend OTP API
      await authService.resendGuestOTP(email)

      // Start the countdown
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Clear the OTP input and any errors
      setOtp(Array(OTP_LENGTH).fill(''))
      setLocalOtpError('')
      dispatch(clearOtpError())

      // Clean up the interval when component unmounts
      return () => clearInterval(timer)
    } catch (error) {
      console.error('Failed to resend OTP:', error)
      setCanResend(true)
    }
  }

  // Handle initial email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      return
    }

    try {
      const result = await dispatch(guestLogin(email))
      if (guestLogin.fulfilled.match(result)) {
        setShowOtpInput(true)
      }
    } catch (error) {
      console.error('Failed to send OTP:', error)
    }
  }

  // Resend timer effect
  useEffect(() => {
    let interval
    if (showOtpInput && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showOtpInput, resendTimer])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {showOtpInput && (
                <button
                  onClick={() => {
                    setShowOtpInput(false)
                    setOtp(Array(OTP_LENGTH).fill(''))
                    setOtpError('')
                  }}
                  className="mr-2 text-gray-500 hover:text-gray-700"
                >
                  <FiArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-xl font-semibold">
                {showOtpInput ? 'Verify OTP' : 'Login or Sign Up'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          {!showOtpInput ? (
            // Email Input Form
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BA8B4E] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="text-xs text-center text-gray-500 mb-6">
                <p className="mb-2">
                  By continuing, you agree to our{' '}
                  <Link
                    href="/terms"
                    className="text-[#BA8B4E] hover:underline"
                  >
                    Terms of Service
                  </Link>{' '}
                  &{' '}
                  <Link
                    href="/privacy"
                    className="text-[#BA8B4E] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#BA8B4E] text-white py-3 rounded-md font-medium hover:bg-[#9a7540] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'SENDING OTP...' : 'CONTINUE'}
              </button>
              {isError && (
                <div className="mt-2 text-red-600 text-sm text-center">
                  {message || 'Failed to send OTP. Please try again.'}
                </div>
              )}
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4 text-center">
                  We&apos;ve sent a 6-digit verification code to{' '}
                  <span className="font-medium">{email}</span>
                </p>

                <div className="flex justify-between gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      data-index={index}
                      className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BA8B4E] focus:border-transparent"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handlePaste}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {(otpError || otpError) && (
                  <p className="text-red-500 text-sm text-center mb-4">
                    {otpError || otpError}
                  </p>
                )}

                <div className="text-center text-sm text-gray-600">
                  {resendTimer > 0 ? (
                    <p>Resend OTP in {resendTimer} seconds</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#BA8B4E] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canResend}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#BA8B4E] text-white py-3 rounded-md font-medium hover:bg-[#9a7540] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={
                  isVerifying || otp.some((digit) => !digit) || otpError
                }
              >
                {isVerifying ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
              </button>
            </form>
          )}

          {!showOtpInput && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#BA8B4E] font-medium hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
