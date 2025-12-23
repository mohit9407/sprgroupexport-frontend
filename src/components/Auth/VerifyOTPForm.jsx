'use client'

import { useState } from 'react'

const VerifyOTPForm = ({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading: externalLoading = false,
  error: externalError = '',
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(externalLoading)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [error, setError] = useState(externalError)

  const handleOtpChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()

    if (/^\d{6}$/.test(pastedData)) {
      const pastedOtp = pastedData.split('').slice(0, 6)
      const newOtp = [...otp]

      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit
      })

      setOtp(newOtp)

      const nextIndex = Math.min(5, pastedOtp.length - 1)
      document.getElementById(`otp-${nextIndex}`).focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    console.log('Form submitted, email:', email, 'OTP:', otpCode)

    if (otpCode.length !== 6) {
      const errorMsg = 'Please enter a valid 6-digit OTP'
      console.log('Validation error:', errorMsg)
      setError(errorMsg)
      return
    }

    console.log('Calling onVerify with OTP:', otpCode)
    onVerify(otpCode)
  }

  const handleResend = async () => {
    try {
      setResendDisabled(true)
      setCountdown(30)
      setError('')

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      await onResend()
    } catch (error) {
      setError(error.message || 'Failed to resend OTP')
      setResendDisabled(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Verify OTP
        </h2>
        <p className="text-gray-600 text-center text-sm mb-2">
          We&apos;ve sent a verification code to
        </p>
        <p className="text-gray-800 font-medium text-center mb-8">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md mb-4">
              {error}
            </div>
          )}
          <div
            className="flex justify-center space-x-2 mb-6"
            onPaste={handlePaste}
          >
            <input
              type="text"
              className="opacity-0 absolute h-0 w-0 overflow-hidden"
              onPaste={handlePaste}
              tabIndex="-1"
              aria-hidden="true"
            />
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:ring-1 focus:ring-[#a07637] focus:border-amber-600 outline-none caret-transparent"
                value={otp[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                pattern="\d*"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-[#b7853f] text-white py-3 px-4 rounded-md font-medium hover:bg-[#a07637] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={otp.join('').length !== 6 || isLoading || externalLoading}
            onClick={(e) => {
              console.log('Verify button clicked')
              handleSubmit(e)
            }}
          >
            {isLoading || externalLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled}
                className="font-medium text-[#b7853f] hover:text-[#a07637] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </p>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-[#b7853f] hover:text-[#a07637] hover:underline"
            >
              Back to Email
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyOTPForm
