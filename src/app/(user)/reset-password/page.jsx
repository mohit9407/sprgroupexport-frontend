import { Suspense } from 'react'
import ResetPasswordClient from '@/components/Auth/ResetPasswordClient'

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          Loading...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  )
}
