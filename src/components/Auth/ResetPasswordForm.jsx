'use client'

import { useState } from 'react'
import Link from 'next/link'

const ResetPasswordForm = ({
  email,
  onSubmit,
  onBack,
  isLoading = false,
  error: externalError = '',
}) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(externalError)
  const [localLoading, setLocalLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (error) setError('')
  }

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
      )
      return
    }

    setLocalLoading(true)
    try {
      await onSubmit({
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })
    } catch (error) {
      setError(error.message || 'Failed to reset password')
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-start md:items-center min-h-screen bg-gray-50 p-4 sm:p-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600 text-center text-sm sm:text-base mb-6 sm:mb-8">
          Create a new password for your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-600 focus:border-amber-600 outline-none pr-12 transition"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-amber-700 hover:text-amber-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number,
              and special character
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-600 focus:border-amber-600 outline-none pr-12 transition"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-amber-700 hover:text-amber-800"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#b7853f] text-white py-3 sm:py-2.5 px-4 rounded-md font-medium hover:bg-[#a07637] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-base sm:text-sm"
            disabled={
              isLoading ||
              localLoading ||
              !formData.password ||
              !formData.confirmPassword
            }
          >
            {isLoading || localLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-[#b7853f] hover:text-[#a07637] hover:underline py-1 px-2 -mx-2 rounded-md active:bg-amber-50"
            >
              Back to OTP Verification
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-medium text-[#b7853f] hover:text-[#a07637] hover:underline py-1 px-0.5 -mx-0.5 rounded-md active:bg-amber-50"
            >
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordForm
