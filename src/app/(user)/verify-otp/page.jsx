import { Suspense } from 'react'
import VerifyOTPClient from '@/components/Auth/VerifyOTPClient'

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          Loading...
        </div>
      }
    >
      <VerifyOTPClient />
    </Suspense>
  )
}
