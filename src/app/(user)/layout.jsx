'use client'

import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer/Footer'

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="grow w-full mx-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA8B4E] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
