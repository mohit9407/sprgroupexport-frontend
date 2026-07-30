'use client'

import { useState } from 'react'
import { authService } from '@/features/auth/authService'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/utils/toastConfig'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export default function AdminAccountPage() {
  const { user, login } = useAuth()
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [changingEmail, setChangingEmail] = useState(false)

  const handlePasswordChange = async (event) => {
    event.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    if (
      passwordForm.newPassword.length < 6 ||
      !/\d/.test(passwordForm.newPassword)
    ) {
      toast.error(
        'New password must be at least 6 characters and contain a number',
      )
      return
    }

    setChangingPassword(true)
    try {
      await authService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to change password'))
    } finally {
      setChangingPassword(false)
    }
  }

  const handleEmailChange = async (event) => {
    event.preventDefault()
    const newEmail = emailForm.newEmail.trim().toLowerCase()

    if (newEmail === user?.email?.toLowerCase()) {
      toast.error('New email must be different from the current email')
      return
    }

    setChangingEmail(true)
    try {
      const response = await authService.changeAdminEmail({
        newEmail,
        currentPassword: emailForm.currentPassword,
      })

      login(response.data, response.token)
      setEmailForm({ newEmail: '', currentPassword: '' })
      toast.success('Email changed successfully')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to change email'))
    } finally {
      setChangingEmail(false)
    }
  }

  const inputClass =
    'w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
  const buttonClass =
    'rounded bg-sky-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the email and password used to sign in to the admin panel.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleEmailChange}
          className="rounded border border-gray-200 bg-white p-5"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Change Email
          </h2>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Current Email
            </span>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className={`${inputClass} cursor-not-allowed bg-gray-100`}
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              New Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={emailForm.newEmail}
              onChange={(event) =>
                setEmailForm((current) => ({
                  ...current,
                  newEmail: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Current Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={emailForm.currentPassword}
              onChange={(event) =>
                setEmailForm((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={changingEmail}
            className={buttonClass}
          >
            {changingEmail ? 'Changing Email...' : 'Change Email'}
          </button>
        </form>

        <form
          onSubmit={handlePasswordChange}
          className="rounded border border-gray-200 bg-white p-5"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Change Password
          </h2>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Current Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={passwordForm.oldPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  oldPassword: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              New Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Confirm New Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={changingPassword}
            className={buttonClass}
          >
            {changingPassword ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
