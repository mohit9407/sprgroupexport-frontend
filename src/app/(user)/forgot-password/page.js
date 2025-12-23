'use client'

import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
