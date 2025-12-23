'use client'

import VerifyOTPForm from '@/components/Auth/VerifyOTPForm'
import { useVerifyOTP } from '@/features/auth/hooks/useVerifyOTP'

export default function VerifyOTPPage() {
  const {
    email,
    loading,
    error,
    isResending,
    resendSuccess,
    handleVerify,
    handleResend,
    handleBack,
  } = useVerifyOTP()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <VerifyOTPForm
          email={email}
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={handleBack}
          isLoading={loading}
          isResending={isResending}
          resendSuccess={resendSuccess}
          error={error}
        />
      </div>
    </div>
  )
}
