'use client'

import Link from 'next/link'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'

const ForgotPasswordForm = () => {
  const {
    email,
    loading,
    success,
    error,
    handleEmailChange,
    handleSubmit,
    resetState,
  } = useForgotPassword()

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-600 text-center text-sm mb-8">
          Enter your email address and we&apos;ll send you a code to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="mt-2">Password reset email sent!</p>
                <p className="text-sm text-gray-600 mt-1">
                  Check your email for the OTP to reset your password.
                </p>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="mt-4 text-sm text-[#b7853f] hover:underline focus:outline-none"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#b7853f] focus:border-[#b7853f] outline-none transition"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-[#b7853f] text-white py-3 px-4 rounded-md font-medium hover:bg-[#a07637] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a07637] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-medium text-[#b7853f] hover:text-[#a07637] hover:underline"
                >
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
