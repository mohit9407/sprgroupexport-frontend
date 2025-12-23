'use client'

import { useState } from 'react'
import Link from 'next/link'

const ChangePasswordForm = ({
  onSubmit,
  isLoading = false,
  error: externalError = '',
}) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
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

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (!validatePassword(formData.newPassword)) {
      setError(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
      )
      return
    }

    setLocalLoading(true)
    try {
      await onSubmit({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    } catch (error) {
      setError(error.message || 'Failed to change password')
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-start md:items-center min-h-screen bg-gray-50 p-4 sm:p-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-2">
          Change Password
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

          {/* Current Password */}
          <div className="space-y-2">
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="oldPassword"
                name="oldPassword"
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none pr-12 transition"
                placeholder="Enter current password"
                value={formData.oldPassword}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showCurrentPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none pr-12 transition"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showNewPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number,
              and special character
            </p>
          </div>

          {/* Confirm New Password */}
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
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none pr-12 transition"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={localLoading || isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#BA8B4E] hover:bg-[#9a7542] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E] transition-colors ${
                localLoading || isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {localLoading || isLoading
                ? 'Changing Password...'
                : 'Change Password'}
            </button>
          </div>

          <div className="text-center text-sm mt-4">
            <Link
              href="/account"
              className="font-medium text-[#BA8B4E] hover:text-[#9a7542] transition-colors"
            >
              Back to My Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordForm
