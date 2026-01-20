'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

export default function AuthModal({ isOpen, onClose, switchToEmail = false }) {
  const authContext = useAuth()
  if (!authContext) {
    console.error('AuthModal - AuthContext is null or undefined!')
    return null
  }
  const { login } = authContext
  const emailInputRef = useRef(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [localOtpError, setLocalOtpError] = useState('')
  const [isEmailMode, setIsEmailMode] = useState(switchToEmail)

  const dispatch = useDispatch()
  const { otpError: reduxOtpError } = useSelector(
    (state) => state.guestAuth || {},
  )

  // Combine local and redux OTP errors
  const otpError = localOtpError || reduxOtpError

  // Focus management
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (isEmailMode && emailInputRef.current) {
          emailInputRef.current.focus()
        } else if (!isEmailMode && showOtpInput) {
          const firstOtpInput = document.querySelector('input[data-index="0"]')
          firstOtpInput?.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isEmailMode, showOtpInput])

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
  const handleOtpChange = useCallback(
    (element, index) => {
      const value = element.target.value
      if (isNaN(value)) return false

      const newOtp = [...otp]
      newOtp[index] = value.substring(value.length - 1)
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
    },
    [otp, dispatch],
  )

  // Handle backspace in OTP input
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus()
    }
  }

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
        const { user, accessToken, refreshToken } = result.payload || {}
    
        if (user && accessToken) {
          if (typeof login === 'function') {
            login(user, { accessToken, refreshToken })
   

            onClose()
          } else {
            console.error('AuthModal - Login function is not available:', login)
          }
        }
      }
    } catch (error) {
      console.error('OTP verification failed:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  // Clear form when modal is closed or mode changes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setOtp(Array(OTP_LENGTH).fill(''))
      setShowOtpInput(false)
      setLocalOtpError('')
      dispatch(clearOtpError())
    }
  }, [isOpen, dispatch])

  // Toggle between email and phone modes
  const toggleAuthMode = useCallback(() => {
    setIsEmailMode((prev) => !prev)
    setShowOtpInput(false)
    setLocalOtpError('')
    dispatch(clearOtpError())
  }, [dispatch])

  // Handle resend OTP
  const handleResendOtp = useCallback(async () => {
    if (!canResend) return

    try {
      setCanResend(false)
      setResendTimer(30)

      await authService.resendGuestOTP(email)

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

      setOtp(Array(OTP_LENGTH).fill(''))
      setLocalOtpError('')
      dispatch(clearOtpError())

      return () => clearInterval(timer)
    } catch (error) {
      console.error('Failed to resend OTP:', error)
      setCanResend(true)
    }
  }, [canResend, email, dispatch])

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsVerifying(true)
      const result = await dispatch(guestLogin(email))
      if (guestLogin.fulfilled.match(result)) {
        setShowOtpInput(true)
      }
    } catch (error) {
      console.error('Failed to send OTP:', error)
    } finally {
      setIsVerifying(false)
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

  // Don't render anything if not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {showOtpInput && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpInput(false)
                    setOtp(Array(OTP_LENGTH).fill(''))
                    setLocalOtpError('')
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
              type="button"
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
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BA8B4E] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
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
                className="w-full bg-[#BA8B4E] text-white py-3 rounded-md font-medium hover:bg-[#9a7540] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-h-[42px]"
                disabled={isVerifying}
              >
                {isVerifying ? 'SENDING OTP...' : 'CONTINUE'}
              </button>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a verification code to {email}
                </p>
                <div className="flex justify-between space-x-2 mb-4">
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-[#BA8B4E] focus:border-transparent"
                      data-index={index}
                      disabled={isVerifying}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm mt-2">{otpError}</p>
                )}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || isVerifying}
                    className={`text-sm ${canResend && !isVerifying ? 'text-[#BA8B4E] hover:underline' : 'text-gray-400'}`}
                  >
                    {isVerifying
                      ? 'Sending...'
                      : canResend
                        ? 'Resend OTP'
                        : `Resend in ${resendTimer}s`}
                  </button>
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
